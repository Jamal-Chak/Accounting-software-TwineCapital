import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'
import { PRICING_PLANS, type PlanId } from '@/lib/pricing'

export async function POST(request: NextRequest) {
    try {
        const { planId } = await request.json()

        if (!planId || !(planId in PRICING_PLANS)) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            )
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        // Get user's company
        const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        const plan = PRICING_PLANS[planId as PlanId]

        // Initialize Flutterwave payment
        const paymentData = {
            tx_ref: `sub_${company.id}_${Date.now()}`,
            amount: plan.price,
            currency: plan.currency,
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/verify`,
            customer: {
                email: user.email,
                name: user.user_metadata?.full_name || 'User',
            },
            customizations: {
                title: 'TwineCapital Subscription',
                description: `${plan.name} Plan - Monthly Subscription`,
                logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
            },
            meta: {
                company_id: company.id,
                plan_id: planId,
                subscription_type: 'monthly',
            },
        }

        // Call Flutterwave API
        const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        })

        const flutterwaveData = await flutterwaveResponse.json()

        if (flutterwaveData.status === 'success') {
            return NextResponse.json({
                success: true,
                payment_link: flutterwaveData.data.link,
                tx_ref: paymentData.tx_ref,
            })
        } else {
            throw new Error('Flutterwave payment initialization failed')
        }

    } catch (error: any) {
        console.error('Payment error:', error)
        return NextResponse.json(
            { error: error.message || 'Payment initialization failed' },
            { status: 500 }
        )
    }
}
