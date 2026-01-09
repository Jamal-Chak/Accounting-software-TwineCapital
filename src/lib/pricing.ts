// Pricing plan configuration
export const PRICING_PLANS = {
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 199,
        currency: 'ZAR',
        interval: 'month',
        popular: false,
        features: [
            'Up to 50 invoices per month',
            '5 clients maximum',
            'Basic analytics',
            'Email support',
            'Invoice management',
            'Client database',
            'Single user'
        ],
        limits: {
            invoices_per_month: 50,
            clients_max: 5,
            users_max: 1
        },
        cta: 'Start Free Trial'
    },
    professional: {
        id: 'professional',
        name: 'Professional',
        price: 399,
        currency: 'ZAR',
        interval: 'month',
        popular: true,
        features: [
            'Unlimited invoices',
            'Unlimited clients',
            'Advanced analytics',
            'Banking integration',
            'AI categorization',
            'Priority email support',
            'Up to 5 users',
            'Everything in Starter'
        ],
        limits: {
            invoices_per_month: null,
            clients_max: null,
            users_max: 5
        },
        cta: 'Start Free Trial'
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 799,
        currency: 'ZAR',
        interval: 'month',
        popular: false,
        features: [
            'Everything in Professional',
            'Custom reports',
            'API access',
            'Dedicated support',
            'Unlimited users',
            'White-label options',
            'Custom integrations',
            'Priority phone support'
        ],
        limits: {
            invoices_per_month: null,
            clients_max: null,
            users_max: null
        },
        cta: 'Start Free Trial'
    }
} as const

export type PlanId = keyof typeof PRICING_PLANS
export type Plan = typeof PRICING_PLANS[PlanId]

// Trial configuration
export const TRIAL_PERIOD_DAYS = 14

// Subscription statuses
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'expired'

// Helper functions
export function getPlanById(planId: PlanId): Plan {
    return PRICING_PLANS[planId]
}

export function formatPrice(price: number, currency: string = 'ZAR'): string {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(price)
}

export function getDaysUntilTrialEnd(trialEndsAt: string): number {
    const now = new Date()
    const endDate = new Date(trialEndsAt)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
}

export function isTrialActive(subscription: { status: string; trial_ends_at?: string }): boolean {
    if (subscription.status !== 'trial') return false
    if (!subscription.trial_ends_at) return false
    return new Date(subscription.trial_ends_at) > new Date()
}

export function isSubscriptionActive(subscription: {
    status: string
    trial_ends_at?: string
    current_period_end?: string
}): boolean {
    if (subscription.status === 'trial') {
        return isTrialActive(subscription)
    }
    if (subscription.status === 'active') {
        return subscription.current_period_end ? new Date(subscription.current_period_end) > new Date() : false
    }
    return false
}
