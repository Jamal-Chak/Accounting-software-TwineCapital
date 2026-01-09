import { NextRequest, NextResponse } from 'next/server'
import { getStitchClient } from '@/lib/stitch/client'
import { supabase } from '@/lib/supabase'
import { encryptToken } from '@/lib/crypto'

/**
 * OAuth callback handler
 * GET /api/banking/connect/callback?code=xxx&state=xxx
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // Check for OAuth errors
        if (error) {
            return NextResponse.redirect(
                new URL(`/banking?error=${encodeURIComponent(error)}`, request.url)
            )
        }

        if (!code || !state) {
            return NextResponse.redirect(
                new URL('/banking?error=missing_parameters', request.url)
            )
        }

        // Verify state (CSRF protection)
        const storedState = request.cookies.get('stitch_state')?.value
        if (!storedState || storedState !== state) {
            return NextResponse.redirect(
                new URL('/banking?error=invalid_state', request.url)
            )
        }

        // Get company ID from cookie
        const companyId = request.cookies.get('stitch_company_id')?.value
        if (!companyId) {
            return NextResponse.redirect(
                new URL('/banking?error=missing_company', request.url)
            )
        }

        // Exchange code for token
        const stitchClient = getStitchClient()
        const tokenData = await stitchClient.exchangeCodeForToken(code)

        // Fetch bank accounts
        const accounts = await stitchClient.getBankAccounts(tokenData.access_token)

        if (accounts.length === 0) {
            return NextResponse.redirect(
                new URL('/banking?error=no_accounts', request.url)
            )
        }

        // Encrypt tokens before storing
        const encryptedAccessToken = encryptToken(tokenData.access_token)
        const encryptedRefreshToken = encryptToken(tokenData.refresh_token)

        // Calculate token expiry
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

        // Store each account as a bank connection
        for (const account of accounts) {
            const { error: dbError } = await supabase
                .from('bank_connections')
                .insert({
                    company_id: companyId,
                    bank_name: mapBankId(account.bankId),
                    account_name: account.name,
                    account_number: account.accountNumber,
                    is_active: true,
                    access_token: encryptedAccessToken,
                    last_synced_at: new Date().toISOString(),
                    // Store Stitch-specific data in metadata
                    stitch_account_id: account.id,
                    stitch_refresh_token: encryptedRefreshToken,
                    token_expires_at: expiresAt.toISOString()
                })

            if (dbError) {
                console.error('Error saving bank connection:', dbError)
            }
        }

        // Clear cookies
        const response = NextResponse.redirect(
            new URL('/banking?success=true', request.url)
        )
        response.cookies.delete('stitch_state')
        response.cookies.delete('stitch_company_id')

        return response
    } catch (error) {
        console.error('Error in OAuth callback:', error)
        return NextResponse.redirect(
            new URL('/banking?error=connection_failed', request.url)
        )
    }
}

/**
 * Map Stitch bank ID to our bank name format
 */
function mapBankId(stitchBankId: string): 'fnb' | 'standard-bank' | 'absa' | 'nedbank' | 'capitec' {
    const mapping: Record<string, any> = {
        'fnb': 'fnb',
        'standard_bank': 'standard-bank',
        'standardbank': 'standard-bank',
        'absa': 'absa',
        'nedbank': 'nedbank',
        'capitec': 'capitec'
    }

    const normalized = stitchBankId.toLowerCase().replace(/[^a-z]/g, '')
    return mapping[normalized] || 'fnb'
}
