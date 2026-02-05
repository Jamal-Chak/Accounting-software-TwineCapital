-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- CLEANUP: Drop all existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can view their own companies" ON companies;
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

DROP POLICY IF EXISTS "Users can view invoice items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items for their invoices" ON invoice_items;

-- POLICIES

-- 1. Companies (The Root)
CREATE POLICY "Users can view their own companies" ON companies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies" ON companies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies" ON companies
    FOR UPDATE USING (auth.uid() = user_id);

-- 2. Clients
CREATE POLICY "Users can view clients for their companies" ON clients
    FOR SELECT USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert clients for their companies" ON clients
    FOR INSERT WITH CHECK (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update clients for their companies" ON clients
    FOR UPDATE USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete clients for their companies" ON clients
    FOR DELETE USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

-- 3. Invoices
CREATE POLICY "Users can view invoices for their companies" ON invoices
    FOR SELECT USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert invoices for their companies" ON invoices
    FOR INSERT WITH CHECK (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update invoices for their companies" ON invoices
    FOR UPDATE USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete invoices for their companies" ON invoices
    FOR DELETE USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

-- 4. Invoice Items
CREATE POLICY "Users can view invoice items for their invoices" ON invoice_items
    FOR SELECT USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert invoice items for their invoices" ON invoice_items
    FOR INSERT WITH CHECK (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
        )
    );

-- 5. Transactions
CREATE POLICY "Users can view transactions for their companies" ON transactions
    FOR SELECT USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert transactions for their companies" ON transactions
    FOR INSERT WITH CHECK (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

-- 6. Expenses
CREATE POLICY "Users can view expenses for their companies" ON expenses
    FOR SELECT USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert expenses for their companies" ON expenses
    FOR INSERT WITH CHECK (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );
