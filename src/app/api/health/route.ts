import { NextResponse } from 'next/server'

// Health check endpoint for production monitoring
export async function GET() {
    try {
        // Check environment
        const checks = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            status: 'healthy',
            checks: {
                supabase: {
                    configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
                    status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'missing'
                },
                encryption: {
                    configured: !!process.env.ENCRYPTION_KEY,
                    status: process.env.ENCRYPTION_KEY ? 'ok' : 'missing'
                },
                email: {
                    configured: !!process.env.RESEND_API_KEY,
                    status: process.env.RESEND_API_KEY ? 'ok' : 'optional'
                },
                banking: {
                    configured: !!(process.env.STITCH_CLIENT_ID && process.env.STITCH_CLIENT_SECRET),
                    status: process.env.STITCH_CLIENT_ID ? 'ok' : 'optional'
                },
                ai: {
                    configured: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
                    status: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'ok' : 'optional'
                }
            }
        }

        // Check if critical services are configured
        const criticalMissing = []
        if (!checks.checks.supabase.configured) criticalMissing.push('Supabase')
        if (!checks.checks.encryption.configured) criticalMissing.push('Encryption Key')

        if (criticalMissing.length > 0) {
            return NextResponse.json({
                ...checks,
                status: 'warning',
                message: `Missing critical configuration: ${criticalMissing.join(', ')}`
            }, { status: 200 })
        }

        return NextResponse.json(checks, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            timestamp: new Date().toISOString(),
            status: 'error',
            error: 'Health check failed'
        }, { status: 500 })
    }
}
