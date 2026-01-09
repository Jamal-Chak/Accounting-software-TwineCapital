import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, password } = body
        let { email } = body

        console.log('Signup attempt:', { email, name, passwordLength: password?.length })

        if (email) {
            console.log('Email chars:', email.split('').map((c: string) => c.charCodeAt(0)))
            // Detailed Env check (masked)
            console.log('Env Check:', {
                urlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                keyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            })
        }

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            )
        }

        email = email.trim()

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // Create Supabase client for auth (cookie handling)
        const supabase = await createClient()

        // Use admin client to bypass RLS and Email Verification
        // This solves the "bounced email" issue by not sending one
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // 1. Create User (Auto-confirmed)
        const { data: adminData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // <--- THE FIX
            user_metadata: { full_name: name }
        })

        if (createError) {
            console.error('Supabase admin create error:', createError)
            return NextResponse.json(
                { error: createError.message },
                { status: 400 }
            )
        }

        if (!adminData.user) {
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            )
        }

        // 2. Sign In (to set session cookies)
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (signInError) {
            console.error('Auto-signin error:', signInError)
            return NextResponse.json(
                { error: signInError.message },
                { status: 400 }
            )
        }

        // Start Dev Session if needed (optional)
        // ...

        // Admin client already initialized above

        // Create company record for the new user
        const { data: companyData, error: companyError } = await supabaseAdmin
            .from('companies')
            .insert([
                {
                    user_id: authData.user.id,
                    name: `${name}'s Company`,
                    country: 'South Africa',
                    currency: 'ZAR',
                },
            ])
            .select()
            .single()

        if (companyError) {
            console.error('Error creating company:', companyError)
            return NextResponse.json(
                { error: `Failed to create company: ${companyError.message}` },
                { status: 500 }
            )
        }

        // Create 14-day trial subscription
        if (companyData) {
            const trialEndsAt = new Date()
            trialEndsAt.setDate(trialEndsAt.getDate() + 14) // 14 days from now

            const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
                .from('subscriptions')
                .insert([
                    {
                        company_id: companyData.id,
                        status: 'trial',
                        trial_ends_at: trialEndsAt.toISOString(),
                        current_period_start: new Date().toISOString(),
                        current_period_end: trialEndsAt.toISOString(),
                    },
                ])
                .select()
                .single()

            if (subscriptionError) {
                console.error('Error creating subscription:', subscriptionError)
                // Continue even if subscription creation fails
            } else if (subscriptionData) {
                // Link subscription to company
                await supabaseAdmin
                    .from('companies')
                    .update({ subscription_id: subscriptionData.id })
                    .eq('id', companyData.id)
            }

            // Initialize chart of accounts
            try {
                const { initializeChartOfAccounts } = await import('@/lib/journal')
                await initializeChartOfAccounts(companyData.id)
            } catch (error) {
                console.error('Error initializing chart of accounts:', error)
                // Continue even if this fails
            }
        }

        return NextResponse.json({
            success: true,
            user: {
                id: authData.user.id,
                email: authData.user.email,
                name: authData.user.user_metadata.full_name,
            },
            message: 'Account created successfully - 14-day trial started!',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
    } catch (error: any) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
