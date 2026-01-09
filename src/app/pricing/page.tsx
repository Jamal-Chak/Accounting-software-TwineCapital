'use client'

import { PRICING_PLANS, formatPrice, type PlanId } from '@/lib/pricing'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
    const router = useRouter()

    const handleSelectPlan = (planId: PlanId) => {
        // Redirect to signup or payment
        router.push(`/signup?plan=${planId}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                        Start with a 14-day free trial. No credit card required.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4" />
                        All plans include 14-day free trial
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {Object.entries(PRICING_PLANS).map(([key, plan]) => {
                        const planId = key as PlanId
                        const isPopular = plan.popular

                        return (
                            <div
                                key={planId}
                                className={`relative bg-white rounded-2xl shadow-lg border-2 ${isPopular ? 'border-blue-500 scale-105' : 'border-gray-200'
                                    } p-8 transition-transform hover:scale-105`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-gray-900">
                                            {formatPrice(plan.price)}
                                        </span>
                                        <span className="text-gray-600">/month</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(planId)}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${isPopular
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* FAQ / Additional Info */}
                <div className="mt-16 text-center text-gray-600">
                    <p className="mb-2">All plans include:</p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <span>✓ 14-day free trial</span>
                        <span>✓ Cancel anytime</span>
                        <span>✓ No credit card required for trial</span>
                        <span>✓ Email support</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
