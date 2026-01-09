-- Migration: Add estimates tables
-- Description: Creates the estimates and estimate_items tables

-- Create estimates table
CREATE TABLE IF NOT EXISTS estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    estimate_number TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    subtotal NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estimate_items table
CREATE TABLE IF NOT EXISTS estimate_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(15, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_estimates_company_id ON estimates(company_id);
CREATE INDEX IF NOT EXISTS idx_estimates_client_id ON estimates(client_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate_id ON estimate_items(estimate_id);

-- Add RLS policies
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;

-- Estimates policies
CREATE POLICY estimates_select_policy ON estimates FOR SELECT USING (true);
CREATE POLICY estimates_insert_policy ON estimates FOR INSERT WITH CHECK (true);
CREATE POLICY estimates_update_policy ON estimates FOR UPDATE USING (true);
CREATE POLICY estimates_delete_policy ON estimates FOR DELETE USING (true);

-- Estimate items policies
CREATE POLICY estimate_items_select_policy ON estimate_items FOR SELECT USING (true);
CREATE POLICY estimate_items_insert_policy ON estimate_items FOR INSERT WITH CHECK (true);
CREATE POLICY estimate_items_update_policy ON estimate_items FOR UPDATE USING (true);
CREATE POLICY estimate_items_delete_policy ON estimate_items FOR DELETE USING (true);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER estimates_updated_at_trigger
    BEFORE UPDATE ON estimates
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();
