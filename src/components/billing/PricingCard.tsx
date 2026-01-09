import { Check } from 'lucide-react'
import { type Plan, formatPrice } from '@/lib/pricing'

interface PricingCardProps {
    plan: Plan
    currentPlanId?: string
    onSelect: (planId: string) => void
    loading?: boolean
    billingInterval?: 'month' | 'year'
}

export function PricingCard({ plan, currentPlanId, onSelect, loading, billingInterval = 'month' }: PricingCardProps) {
    const isCurrent = currentPlanId === plan.id
    const isPopular = plan.popular

    return (
        <div className={`relative flex flex-col p-6 bg-white rounded-2xl border ${isCurrent ? 'border-blue-500 shadow-lg ring-1 ring-blue-500' : 'border-gray-200 shadow-sm hover:shadow-md transition-shadow'} ${isPopular && !isCurrent ? 'border-indigo-500 ring-1 ring-indigo-500' : ''}`}>

            {isPopular && (
                <div className="absolute top-0 right-0 -mr-1 -mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500 text-white shadow-sm">
                        Popular
                    </span>
                </div>
            )}

            <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-500 text-sm">Perfect for growing your business.</p>
            </div>

            <div className="mb-5 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(plan.price, plan.currency)}</span>
                <span className="ml-1 text-gray-500 text-sm">/{billingInterval}</span>
            </div>

            <ul className="mb-8 space-y-4 flex-1">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-blue-500 shrink-0 mr-3" />
                        <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onSelect(plan.id)}
                disabled={isCurrent || loading}
                className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isCurrent
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : 'bg-black text-white hover:bg-gray-800 focus:ring-black'
                    }`}
            >
                {loading ? 'Processing...' : isCurrent ? 'Current Plan' : plan.cta}
            </button>
        </div>
    )
}
