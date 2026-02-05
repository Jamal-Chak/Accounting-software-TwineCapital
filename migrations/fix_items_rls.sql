
-- Create items table if it doesn't exist
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    unit_price NUMERIC(15, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 15,
    category TEXT DEFAULT 'product',
    sku TEXT,
    current_stock INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own company items" ON items;
DROP POLICY IF EXISTS "Users can insert own company items" ON items;
DROP POLICY IF EXISTS "Users can update own company items" ON items;
DROP POLICY IF EXISTS "Users can delete own company items" ON items;

-- Create Policies
CREATE POLICY "Users can view own company items" ON items
    FOR SELECT
    USING (company_id IN (
        SELECT id FROM companies WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own company items" ON items
    FOR INSERT
    WITH CHECK (company_id IN (
        SELECT id FROM companies WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update own company items" ON items
    FOR UPDATE
    USING (company_id IN (
        SELECT id FROM companies WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own company items" ON items
    FOR DELETE
    USING (company_id IN (
        SELECT id FROM companies WHERE user_id = auth.uid()
    ));

-- Ensure invoice_items exists for insights
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT,
    quantity NUMERIC(10,2),
    unit_price NUMERIC(15,2),
    amount NUMERIC(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
