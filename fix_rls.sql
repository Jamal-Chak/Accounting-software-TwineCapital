-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;

-- 1. Invoices Policies
CREATE POLICY "Users can view invoices for their companies" ON invoices
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert invoices for their companies" ON invoices
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update invoices for their companies" ON invoices
    FOR UPDATE USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete invoices for their companies" ON invoices
    FOR DELETE USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

-- 2. Invoice Items Policies (Linked via invoice_id)
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

CREATE POLICY "Users can update invoice items for their invoices" ON invoice_items
    FOR UPDATE USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can delete invoice items for their invoices" ON invoice_items
    FOR DELETE USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
        )
    );

-- 3. Transactions Policies
CREATE POLICY "Users can view transactions for their companies" ON transactions
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert transactions for their companies" ON transactions
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );
