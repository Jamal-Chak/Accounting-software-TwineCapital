import { NextRequest, NextResponse } from 'next/server'
import { getStitchClient } from '@/lib/stitch/client'
import { getCompanyId } from '@/lib/database'
import crypto from 'crypto'

/**
 * Initiate bank connection OAuth flow
 * GET /api/banking/connect/initiate
 */
export async function GET(request: NextRequest) {
    try {
        const companyId = await getCompanyId()
        if (!companyId) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        // Generate state for CSRF protection
        const state = crypto.randomBytes(32).toString('hex')

        // Store state in session/cookie for verification
        const response = NextResponse.json({
            authUrl: null,
            state: state
        })

        // Check if Stitch credentials are configured
        const stitchClient = getStitchClient()

        if (!process.env.STITCH_CLIENT_ID || !process.env.STITCH_CLIENT_SECRET) {
            return NextResponse.json(
                {
                    error: 'Stitch API not configured',
                    message: 'Please configure STITCH_CLIENT_ID and STITCH_CLIENT_SECRET environment variables',
                    demoMode: true
                },
                { status: 503 }
            )
        }

        // Generate authorization URL
        const authUrl = stitchClient.getAuthorizationUrl(state, ['accounts', 'transactions'])

        // Store state in cookie for verification in callback
        response.cookies.set('stitch_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600 // 10 minutes
        })

        // Store company ID for callback
        response.cookies.set('stitch_company_id', companyId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600
        })

        return NextResponse.json({ authUrl, state })
    } catch (error) {
        console.error('Error initiating bank connection:', error)
        return NextResponse.json(
            { error: 'Failed to initiate bank connection' },
            { status: 500 }
        )
    }
}
