-- Tax Rates Table

CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_rates_company_id ON tax_rates(company_id);

-- RLS
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view tax rates for their companies" ON tax_rates
    FOR SELECT USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert tax rates for their companies" ON tax_rates
    FOR INSERT WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update tax rates for their companies" ON tax_rates
    FOR UPDATE USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete tax rates for their companies" ON tax_rates
    FOR DELETE USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Insert default tax rates for existing companies
INSERT INTO tax_rates (company_id, name, rate, is_default)
SELECT id, 'Standard VAT (15%)', 15.00, true
FROM companies
WHERE NOT EXISTS (SELECT 1 FROM tax_rates WHERE company_id = companies.id AND is_default = true);
