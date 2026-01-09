-- TwineCapital Subscription System
-- Run this after setup_auth.sql

-- ============================================
-- 1. Create Pricing Plans Table
-- ============================================

CREATE TABLE IF NOT EXISTS pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'starter', 'professional', 'enterprise'
    display_name TEXT NOT NULL,
    price_monthly INTEGER NOT NULL, -- in cents (e.g., 19900 for R199)
    currency TEXT DEFAULT 'ZAR',
    features JSONB,
    limits JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Create Subscriptions Table
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES pricing_plans(id),
    status TEXT NOT NULL DEFAULT 'trial', -- 'trial', 'active', 'past_due', 'canceled', 'expired'
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    flutterwave_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Create Payment Transactions Table
-- ============================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'succeeded', 'failed'
    provider TEXT NOT NULL DEFAULT 'flutterwave',
    provider_transaction_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. Add Subscription to Companies
-- ============================================

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);

-- ============================================
-- 5. Insert Default Pricing Plans
-- ============================================

INSERT INTO pricing_plans (name, display_name, price_monthly, features, limits) VALUES
('starter', 'Starter', 19900, 
    '["Basic analytics", "Email support", "Invoice management", "Client database"]'::jsonb,
    '{"invoices_per_month": 50, "clients_max": 5, "users_max": 1}'::jsonb
),
('professional', 'Professional', 39900,
    '["Everything in Starter", "Advanced analytics", "Banking integration", "AI categorization", "Priority support", "Unlimited invoices"]'::jsonb,
    '{"invoices_per_month": null, "clients_max": null, "users_max": 5}'::jsonb
),
('enterprise', 'Enterprise', 79900,
    '["Everything in Professional", "Custom reports", "API access", "Dedicated support", "Unlimited users", "White-label options"]'::jsonb,
    '{"invoices_per_month": null, "clients_max": null, "users_max": null}'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 6. Enable RLS on New Tables
-- ============================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. Create RLS Policies for Subscriptions
-- ============================================

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT 
    USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE
    USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- 8. Create RLS Policies for Transactions
-- ============================================

DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
CREATE POLICY "Users can view own transactions" ON payment_transactions
    FOR SELECT
    USING (
        subscription_id IN (
            SELECT s.id FROM subscriptions s
            JOIN companies c ON s.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- ============================================
-- 9. Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_id ON companies(subscription_id);

-- ============================================
-- 10. Create Helper Function - Check Trial Status
-- ============================================

CREATE OR REPLACE FUNCTION is_trial_active(subscription_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM subscriptions
        WHERE id = subscription_id
        AND status = 'trial'
        AND trial_ends_at > NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. Create Helper Function - Check Subscription Active
-- ============================================

CREATE OR REPLACE FUNCTION is_subscription_active(company_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.company_id = company_id_param
        AND (
            (s.status = 'trial' AND s.trial_ends_at > NOW())
            OR (s.status = 'active' AND s.current_period_end > NOW())
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPLETE!
-- ============================================
-- Subscription system database is ready
-- Next: Run the app and test signup flow
