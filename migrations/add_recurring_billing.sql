-- Recurring Invoices Schema
-- Manages subscription-based billing and recurring invoices

-- Recurring invoice templates
CREATE TABLE IF NOT EXISTS recurring_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Template details
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Billing configuration
    frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    interval_count INTEGER NOT NULL DEFAULT 1, -- e.g., every 2 months
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for indefinite
    next_billing_date DATE NOT NULL,
    
    -- Invoice details
    notes TEXT,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'cancelled', 'completed'
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Payment settings
    auto_charge BOOLEAN NOT NULL DEFAULT false,
    payment_method VARCHAR(50), -- 'manual', 'payfast', 'ozow', 'debit_order'
    payment_gateway_id VARCHAR(255), -- External payment method ID
    
    -- Tracking
    total_invoices_generated INTEGER NOT NULL DEFAULT 0,
    last_invoice_id UUID REFERENCES invoices(id),
    last_invoice_date DATE,
    
    -- Retry logic for failed payments
    max_retry_attempts INTEGER NOT NULL DEFAULT 3,
    retry_interval_days INTEGER NOT NULL DEFAULT 3,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Recurring invoice line items (template)
CREATE TABLE IF NOT EXISTS recurring_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recurring_invoice_id UUID NOT NULL REFERENCES recurring_invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Payment attempt tracking
CREATE TABLE IF NOT EXISTS payment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    recurring_invoice_id UUID REFERENCES recurring_invoices(id),
    
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    gateway VARCHAR(50), -- 'payfast', 'ozow', 'manual'
    gateway_transaction_id VARCHAR(255),
    
    status VARCHAR(50) NOT NULL, -- 'pending', 'success', 'failed', 'cancelled'
    failure_reason TEXT,
    
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_company ON recurring_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_client ON recurring_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_billing ON recurring_invoices(next_billing_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_status ON recurring_invoices(status);

CREATE INDEX IF NOT EXISTS idx_recurring_items_invoice ON recurring_invoice_items(recurring_invoice_id);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_invoice ON payment_attempts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_recurring ON payment_attempts(recurring_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON payment_attempts(status);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_recurring_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recurring_invoices_updated_at
    BEFORE UPDATE ON recurring_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_recurring_invoices_updated_at();

-- RLS Policies
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;

-- Recurring invoices policies
CREATE POLICY recurring_invoices_select ON recurring_invoices
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM company_users WHERE company_id = recurring_invoices.company_id
    ));

CREATE POLICY recurring_invoices_insert ON recurring_invoices
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM company_users WHERE company_id = recurring_invoices.company_id
    ));

CREATE POLICY recurring_invoices_update ON recurring_invoices
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM company_users WHERE company_id = recurring_invoices.company_id
    ));

CREATE POLICY recurring_invoices_delete ON recurring_invoices
    FOR DELETE USING (auth.uid() IN (
        SELECT user_id FROM company_users WHERE company_id = recurring_invoices.company_id
    ));

-- Recurring items policies
CREATE POLICY recurring_items_select ON recurring_invoice_items
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM company_users cu
        JOIN recurring_invoices ri ON ri.company_id = cu.company_id
        WHERE ri.id = recurring_invoice_items.recurring_invoice_id
    ));

CREATE POLICY recurring_items_insert ON recurring_invoice_items
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM company_users cu
        JOIN recurring_invoices ri ON ri.company_id = cu.company_id
        WHERE ri.id = recurring_invoice_items.recurring_invoice_id
    ));

CREATE POLICY recurring_items_update ON recurring_invoice_items
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM company_users cu
        JOIN recurring_invoices ri ON ri.company_id = cu.company_id
        WHERE ri.id = recurring_invoice_items.recurring_invoice_id
    ));

CREATE POLICY recurring_items_delete ON recurring_invoice_items
    FOR DELETE USING (auth.uid() IN (
        SELECT user_id FROM company_users cu
        JOIN recurring_invoices ri ON ri.company_id = cu.company_id
        WHERE ri.id = recurring_invoice_items.recurring_invoice_id
    ));

-- Payment attempts policies
CREATE POLICY payment_attempts_select ON payment_attempts
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM company_users cu
        JOIN invoices inv ON inv.company_id = cu.company_id
        WHERE inv.id = payment_attempts.invoice_id
    ));

CREATE POLICY payment_attempts_insert ON payment_attempts
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM company_users cu
        JOIN invoices inv ON inv.company_id = cu.company_id
        WHERE inv.id = payment_attempts.invoice_id
    ));
