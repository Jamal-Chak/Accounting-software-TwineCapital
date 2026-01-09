'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/auth/supabase-client'
import { getDaysUntilTrialEnd, formatPrice, PRICING_PLANS } from '@/lib/pricing'
import { AlertCircle, CreditCard, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Subscription {
    id: string
    status: string
    trial_ends_at?: string
    current_period_end?: string
    plan_id?: string
}

export function SubscriptionStatus() {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSubscription() {
            const supabase = createClient()

            // Get current user's company
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: company } = await supabase
                .from('companies')
                .select('subscription_id')
                .eq('user_id', user.id)
                .single()

            if (!company?.subscription_id) return

            // Get subscription details
            const { data: sub } = await supabase
                .from('subscriptions')
                .select('*, pricing_plans(*)')
                .eq('id', company.subscription_id)
                .single()

            setSubscription(sub as any)
            setLoading(false)
        }

        fetchSubscription()
    }, [])

    if (loading || !subscription) return null

    const isTrial = subscription.status === 'trial'
    const isActive = subscription.status === 'active'
    const isExpired = subscription.status === 'expired' || subscription.status === 'canceled'

    if (isTrial && subscription.trial_ends_at) {
        const daysLeft = getDaysUntilTrialEnd(subscription.trial_ends_at)

        if (daysLeft <= 3) {
            return (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900 mb-1">
                                Trial Ending Soon
                            </h3>
                            <p className="text-sm text-amber-800 mb-3">
                                Your free trial ends in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}.
                                Choose a plan to continue using TwineCapital.
                            </p>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                            >
                                <CreditCard className="w-4 h-4" />
                                Choose Plan
                            </Link>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-1">
                            Free Trial Active
                        </h3>
                        <p className="text-sm text-blue-800">
                            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining in your trial.
                            Enjoying TwineCapital?{' '}
                            <Link href="/pricing" className="underline font-medium">
                                View plans
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (isExpired) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-red-900 mb-1">
                            Subscription Expired
                        </h3>
                        <p className="text-sm text-red-800 mb-3">
                            Your subscription has ended. Reactivate to continue using TwineCapital.
                        </p>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                            <CreditCard className="w-4 h-4" />
                            Reactivate
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Active subscription - show minimal info
    return null
}
