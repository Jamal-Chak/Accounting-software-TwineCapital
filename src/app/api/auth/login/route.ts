import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Create Supabase client
        const supabase = await createClient()

        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            console.error('Supabase auth error:', authError)
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            success: true,
            user: {
                id: authData.user.id,
                email: authData.user.email,
                name: authData.user.user_metadata?.full_name,
            },
            message: 'Signed in successfully',
        })
    } catch (error: any) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
