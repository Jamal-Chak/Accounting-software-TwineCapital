import { NextRequest, NextResponse } from 'next/server'
import { getStitchClient } from '@/lib/stitch/client'
import { supabase } from '@/lib/supabase'
import { decryptToken, encryptToken } from '@/lib/crypto'

/**
 * Sync transactions from Stitch for all bank connections
 * POST /api/banking/sync
 */
export async function POST(request: NextRequest) {
    try {
        const { companyId, connectionId } = await request.json()

        if (!companyId) {
            return NextResponse.json(
                { error: 'Company ID required' },
                { status: 400 }
            )
        }

        const stitchClient = getStitchClient()

        // Get bank connections to sync
        let query = supabase
            .from('bank_connections')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_active', true)

        if (connectionId) {
            query = query.eq('id', connectionId)
        }

        const { data: connections, error: fetchError } = await query

        if (fetchError) {
            return NextResponse.json(
                { error: 'Failed to fetch connections' },
                { status: 500 }
            )
        }

        if (!connections || connections.length === 0) {
            return NextResponse.json(
                { message: 'No active connections to sync' },
                { status: 200 }
            )
        }

        const results = []

        for (const connection of connections) {
            try {
                // Decrypt access token
                let accessToken = decryptToken(connection.access_token)

                // Check if token is expired
                const expiresAt = new Date(connection.token_expires_at)
                if (expiresAt < new Date()) {
                    // Refresh token
                    const refreshToken = decryptToken(connection.stitch_refresh_token)
                    const newTokenData = await stitchClient.refreshAccessToken(refreshToken)

                    // Update connection with new tokens
                    await supabase
                        .from('bank_connections')
                        .update({
                            access_token: encryptToken(newTokenData.access_token),
                            stitch_refresh_token: encryptToken(newTokenData.refresh_token),
                            token_expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString()
                        })
                        .eq('id', connection.id)

                    // Use new access token
                    accessToken = newTokenData.access_token
                }

                // Fetch transactions from last 90 days
                const fromDate = new Date()
                fromDate.setDate(fromDate.getDate() - 90)

                const transactions = await stitchClient.getTransactions(
                    accessToken,
                    connection.stitch_account_id,
                    fromDate.toISOString().split('T')[0],
                    new Date().toISOString().split('T')[0]
                )

                // Store transactions in database
                let imported = 0
                let skipped = 0

                for (const transaction of transactions) {
                    // Check if transaction already exists
                    const { data: existing } = await supabase
                        .from('transactions')
                        .select('id')
                        .eq('external_id', transaction.id)
                        .single()

                    if (existing) {
                        skipped++
                        continue
                    }

                    // Insert new transaction
                    const { error: insertError } = await supabase
                        .from('transactions')
                        .insert({
                            bank_connection_id: connection.id,
                            external_id: transaction.id,
                            date: transaction.date,
                            amount: transaction.amount,
                            description: transaction.description,
                            merchant: transaction.merchant || null,
                            category: transaction.category || null,
                            is_reconciled: false
                        })

                    if (insertError) {
                        console.error('Error inserting transaction:', insertError)
                    } else {
                        imported++
                    }
                }

                // Update last synced timestamp
                await supabase
                    .from('bank_connections')
                    .update({ last_synced_at: new Date().toISOString() })
                    .eq('id', connection.id)

                results.push({
                    connectionId: connection.id,
                    accountName: connection.account_name,
                    imported,
                    skipped,
                    total: transactions.length
                })
            } catch (error) {
                console.error(`Error syncing connection ${connection.id}:`, error)
                results.push({
                    connectionId: connection.id,
                    accountName: connection.account_name,
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }

        return NextResponse.json({
            success: true,
            results
        })
    } catch (error) {
        console.error('Error syncing transactions:', error)
        return NextResponse.json(
            { error: 'Failed to sync transactions' },
            { status: 500 }
        )
    }
}


