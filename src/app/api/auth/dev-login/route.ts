import { NextRequest, NextResponse } from 'next/server'

// DEV ONLY - Bypass authentication for development
export async function GET(request: NextRequest) {
    // Only allow in development
    const isDevelopment = process.env.NODE_ENV !== 'production'

    if (!isDevelopment) {
        return NextResponse.json(
            { error: 'Dev login is only available in development mode' },
            { status: 403 }
        )
    }

    console.log('🔓 DEV: Auto-login bypass activated')

    // Redirect to dashboard with dev session cookie
    const dashboardUrl = new URL('/dashboard', request.url)
    const response = NextResponse.redirect(dashboardUrl)

    // Set a simple cookie to mark as "logged in"
    response.cookies.set('dev_session', 'active', {
        httpOnly: true,
        secure: false, // Keep false in dev
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
}

export async function POST(request: NextRequest) {
    return GET(request)
}
