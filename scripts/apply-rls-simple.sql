-- APPLY THIS IN SUPABASE SQL EDITOR
-- Simple RLS policies for TwineCapital

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can insert their own companies" ON companies;
DROP POLICY IF EXISTS "Users can update their own companies" ON companies;
DROP POLICY IF EXISTS "Users can view clients for their companies" ON clients;
DROP POLICY IF EXISTS "Users can insert clients for their companies" ON clients;
DROP POLICY IF EXISTS "Users can update clients for their companies" ON clients;
DROP POLICY IF EXISTS "Users can delete clients for their companies" ON clients;
DROP POLICY IF EXISTS "Users can view invoices for their companies" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices for their companies" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices for their companies" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices for their companies" ON invoices;
DROP POLICY IF EXISTS "Users can view invoice items for their companies" ON invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items for their companies" ON invoice_items;

-- Companies
CREATE POLICY "Users can view their own company" ON companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own companies" ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own companies" ON companies FOR UPDATE USING (auth.uid() = user_id);

-- Clients  
CREATE POLICY "Users can view clients for their companies" ON clients FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert clients for their companies" ON clients FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update clients for their companies" ON clients FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete clients for their companies" ON clients FOR DELETE USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
);

-- Invoices
CREATE POLICY "Users can view invoices for their companies" ON invoices FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert invoices for their companies" ON invoices FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update invoices for their companies" ON invoices FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete invoices for their companies" ON invoices FOR DELETE USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
);

-- Invoice Items
CREATE POLICY "Users can view invoice items for their companies" ON invoice_items FOR SELECT USING (
    invoice_id IN (
        SELECT id FROM invoices WHERE company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    )
);
CREATE POLICY "Users can insert invoice items for their companies" ON invoice_items FOR INSERT WITH CHECK (
    invoice_id IN (
        SELECT id FROM invoices WHERE company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    )
);
