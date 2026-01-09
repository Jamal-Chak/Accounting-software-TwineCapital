import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')
        const tx_ref = searchParams.get('tx_ref')
        const transaction_id = searchParams.get('transaction_id')

        if (!tx_ref || !transaction_id) {
            return NextResponse.redirect(new URL('/dashboard?payment=failed', request.url))
        }

        // Verify payment with Flutterwave
        const verifyResponse = await fetch(
            `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                },
            }
        )

        const verifyData = await verifyResponse.json()

        if (verifyData.status === 'success' && verifyData.data.status === 'successful') {
            const supabase = await createClient()
            const { company_id, plan_id } = verifyData.data.meta

            // Get the plan from pricing_plans table
            const { data: pricingPlan } = await supabase
                .from('pricing_plans')
                .select('*')
                .eq('name', plan_id)
                .single()

            if (!pricingPlan) {
                throw new Error('Plan not found')
            }

            // Get current subscription
            const { data: currentSub } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('company_id', company_id)
                .single()

            if (currentSub) {
                // Update existing subscription
                const periodStart = new Date()
                const periodEnd = new Date()
                periodEnd.setMonth(periodEnd.getMonth() + 1)

                await supabase
                    .from('subscriptions')
                    .update({
                        plan_id: pricingPlan.id,
                        status: 'active',
                        trial_ends_at: null,
                        current_period_start: periodStart.toISOString(),
                        current_period_end: periodEnd.toISOString(),
                        flutterwave_subscription_id: transaction_id,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', currentSub.id)

                // Record payment transaction
                await supabase
                    .from('payment_transactions')
                    .insert({
                        subscription_id: currentSub.id,
                        amount: verifyData.data.amount,
                        currency: verifyData.data.currency,
                        status: 'succeeded',
                        provider: 'flutterwave',
                        provider_transaction_id: transaction_id,
                        metadata: { tx_ref, verification: verifyData.data },
                    })
            }

            return NextResponse.redirect(new URL('/dashboard?payment=success', request.url))
        } else {
            return NextResponse.redirect(new URL('/dashboard?payment=failed', request.url))
        }

    } catch (error: any) {
        console.error('Payment verification error:', error)
        return NextResponse.redirect(new URL('/dashboard?payment=error', request.url))
    }
}
