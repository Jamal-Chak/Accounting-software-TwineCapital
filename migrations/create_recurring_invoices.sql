
-- Create recurring_invoices table
CREATE TABLE IF NOT EXISTS recurring_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL, -- To link to the main company
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    interval TEXT NOT NULL CHECK (interval IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    next_run_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying processing queue
CREATE INDEX IF NOT EXISTS idx_recurring_next_run ON recurring_invoices(company_id, status, next_run_date);
