import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Define route types
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password')
    const isApiAuthRoute = pathname.startsWith('/api/auth')
    const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico'
    const isHomePage = pathname === '/'
    // const isDevAccess = pathname.startsWith('/dev-access') // Unused currently in main logic flow but good to keep if needed later
    const isTestTool = pathname.startsWith('/auth-test')

    // 2. Create an initial response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 3. Create Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 4. Refresh session if needed
    // IMPORTANT: You *must* call getUser() to refresh the session token
    const { data: { user } } = await supabase.auth.getUser()

    // 5. DEV: Check for development bypass session (only works in development)
    const devSession = request.cookies.get('dev_session')
    const startDevSession = pathname.startsWith('/dev-access') && process.env.NODE_ENV === 'development'

    // Allow access to dev-access page in dev mode
    if (startDevSession) {
        return response
    }

    if (devSession?.value === 'active' && process.env.NODE_ENV === 'development') {
        // console.log('🔓 DEV: Bypass session active')
        return response
    }

    // 6. Auth Protection Logic

    // Always allow these routes
    if (isHomePage || isAuthRoute || isApiAuthRoute || isPublicAsset || isTestTool) {
        return response
    }

    // If user is NOT authenticated, redirect to login
    if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon)
         * - public files (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
