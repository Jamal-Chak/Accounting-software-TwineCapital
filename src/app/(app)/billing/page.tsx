'use client'

import { useState, useEffect } from 'react'
import { PRICING_PLANS, type PlanId } from '@/lib/pricing'
import { PricingCard } from '@/components/billing/PricingCard'
import { createClient } from '@/lib/auth/supabase-client'
import { Loader2, CreditCard, CheckCircle2, History } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Helper to safely access plans array
const plans = Object.values(PRICING_PLANS)

export default function BillingPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const [loading, setLoading] = useState(false)
    const [currentPlanId, setCurrentPlanId] = useState<string | null>(null)
    const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
    const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
    const [companyId, setCompanyId] = useState<string | null>(null)

    // Check payment status from URL
    const paymentStatus = searchParams['payment'] as string

    const loadSubscription = async () => {
        const supabase = createClient()

        // Get user company
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: company } = await supabase
            .from('companies')
            .select('*, subscriptions(*)')
            .eq('user_id', user.id)
            .single()

        if (company) {
            setCompanyId(company.id)
            if (company.subscriptions) {
                // In a real app, you might have multiple subs, here we assume one active/trial
                // The relationship might be one-to-many but let's take the latest
                // Assuming 1:1 or we pick the relevant one. 
                // Based on schema, companies has subscription_id, or subscriptions has company_id
                // Let's use the one linked in companies if exists, or query subscriptions table directly if needed.
                // The schema from previous context suggested companies has subscription_id.
                // But wait, the previous `verify` route updated `subscriptions` table.
                // Let's fetch the subscription directly using company_id.

                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*, pricing_plans(*)')
                    .eq('company_id', company.id)
                    .single() // Assumption: one active sub per company

                if (sub) {
                    setSubscriptionStatus(sub.status)
                    setTrialEndsAt(sub.trial_ends_at)
                    // If we have a pricing plan linked
                    if (sub.pricing_plans) {
                        // Map database plan name/id to our local config
                        // This part depends on how your DB `pricing_plans` name matches `lib/pricing` IDs.
                        // Assuming `sub.pricing_plans.name` === 'starter' | 'professional' | 'enterprise'
                        setCurrentPlanId(sub.pricing_plans.name.toLowerCase())
                    } else if (sub.status === 'trial') {
                        // Trial usually defaults to something or has no plan_id yet
                        // For now, let's assume no plan selected implies 'starter' trial or similar
                        // Or just null
                    }
                }
            }
        }
    }

    useEffect(() => {
        loadSubscription()
    }, [])

    const handleUpgrade = async (planId: string) => {
        setLoading(true)
        try {
            const response = await fetch('/api/subscription/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            })

            const data = await response.json()

            if (data.success && data.payment_link) {
                // Redirect to Flutterwave
                window.location.href = data.payment_link
            } else {
                alert(data.error || 'Failed to initiate checkout')
                setLoading(false)
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('An unexpected error occurred')
            setLoading(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

            {/* Payment Feedback */}
            {paymentStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-green-800">
                    <CheckCircle2 className="w-5 h-5" />
                    <div>
                        <h4 className="font-medium">Payment Successful!</h4>
                        <p className="text-sm">Your subscription has been updated.</p>
                    </div>
                </div>
            )}
            {paymentStatus === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-800">
                    <CreditCard className="w-5 h-5" />
                    <div>
                        <h4 className="font-medium">Payment Failed</h4>
                        <p className="text-sm">Please try again or use a different card.</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
                <p className="mt-1 text-gray-500">Manage your plan and payment details.</p>
            </div>

            {/* Current Status Card */}
            <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            Current Status:
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                                subscriptionStatus === 'trial' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {subscriptionStatus || 'Loading...'}
                            </span>
                        </h3>
                        {trialEndsAt && subscriptionStatus === 'trial' && (
                            <p className="mt-1 text-sm text-gray-500">
                                Your free trial ends on {new Date(trialEndsAt).toLocaleDateString()}
                            </p>
                        )}
                        {!subscriptionStatus && <p className="text-sm text-gray-400">Fetching subscription details...</p>}
                    </div>
                    {/* Add Manage Payment Method button if active */}
                </div>
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        currentPlanId={currentPlanId || undefined}
                        onSelect={handleUpgrade}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Invoice History Placeholder */}
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <History className="w-4 h-4 text-gray-500" />
                        Billing History
                    </h3>
                </div>
                <div className="p-12 text-center text-gray-500">
                    <p>No invoices found.</p>
                </div>
            </div>
        </div>
    )
}
