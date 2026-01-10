-- =====================================================
-- CREATE COMPREHENSIVE RLS POLICIES
-- Run this in Supabase SQL Editor after verification
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INVOICES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own company invoices" ON invoices;
CREATE POLICY "Users can view own company invoices" ON invoices
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own company invoices" ON invoices;
CREATE POLICY "Users can create own company invoices" ON invoices
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own company invoices" ON invoices;
CREATE POLICY "Users can update own company invoices" ON invoices
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own company invoices" ON invoices;
CREATE POLICY "Users can delete own company invoices" ON invoices
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- INVOICE ITEMS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own invoice items" ON invoice_items;
CREATE POLICY "Users can view own invoice items" ON invoice_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT id FROM companies WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create own invoice items" ON invoice_items;
CREATE POLICY "Users can create own invoice items" ON invoice_items
  FOR INSERT WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT id FROM companies WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own invoice items" ON invoice_items;
CREATE POLICY "Users can update own invoice items" ON invoice_items
  FOR UPDATE USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT id FROM companies WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete own invoice items" ON invoice_items;
CREATE POLICY "Users can delete own invoice items" ON invoice_items
  FOR DELETE USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id IN (
        SELECT id FROM companies WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- CLIENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own company clients" ON clients;
CREATE POLICY "Users can view own company clients" ON clients
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own company clients" ON clients;
CREATE POLICY "Users can create own company clients" ON clients
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own company clients" ON clients;
CREATE POLICY "Users can update own company clients" ON clients
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own company clients" ON clients;
CREATE POLICY "Users can delete own company clients" ON clients
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- EXPENSES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own company expenses" ON expenses;
CREATE POLICY "Users can view own company expenses" ON expenses
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own company expenses" ON expenses;
CREATE POLICY "Users can create own company expenses" ON expenses
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own company expenses" ON expenses;
CREATE POLICY "Users can update own company expenses" ON expenses
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own company expenses" ON expenses;
CREATE POLICY "Users can delete own company expenses" ON expenses
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own company subscription" ON subscriptions;
CREATE POLICY "Users can view own company subscription" ON subscriptions
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own company subscription" ON subscriptions;
CREATE POLICY "Users can update own company subscription" ON subscriptions
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- BANK CONNECTIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own bank connections" ON bank_connections;
CREATE POLICY "Users can view own bank connections" ON bank_connections
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own bank connections" ON bank_connections;
CREATE POLICY "Users can create own bank connections" ON bank_connections
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own bank connections" ON bank_connections;
CREATE POLICY "Users can update own bank connections" ON bank_connections
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own bank connections" ON bank_connections;
CREATE POLICY "Users can delete own bank connections" ON bank_connections
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- TRANSACTIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- ACCOUNTS (CHART OF ACCOUNTS) TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own company accounts" ON accounts;
CREATE POLICY "Users can view own company accounts" ON accounts
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own company accounts" ON accounts;
CREATE POLICY "Users can create own company accounts" ON accounts
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own company accounts" ON accounts;
CREATE POLICY "Users can update own company accounts" ON accounts
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- JOURNAL ENTRIES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own journal entries" ON journal_entries;
CREATE POLICY "Users can create own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- TAX RATES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own company tax rates" ON tax_rates;
CREATE POLICY "Users can view own company tax rates" ON tax_rates
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own company tax rates" ON tax_rates;
CREATE POLICY "Users can create own company tax rates" ON tax_rates
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own company tax rates" ON tax_rates;
CREATE POLICY "Users can update own company tax rates" ON tax_rates
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own company tax rates" ON tax_rates;
CREATE POLICY "Users can delete own company tax rates" ON tax_rates
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- VERIFICATION QUERY
-- Run this after creating policies to verify
-- =====================================================

SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
