-- Fix RLS Policies for TwineCapital
-- This script enables authenticated users to create and manage their own data

-- 1. Enable RLS on all tables (if not already enabled)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can create their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;

DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients for their company" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices for their company" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can view invoice items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can create invoice items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items for their invoices" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items for their invoices" ON invoice_items;

-- 3. Create new RLS policies

-- COMPANIES TABLE
-- Allow users to view their own company
CREATE POLICY "Users can view their own company"
    ON companies FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to create a company for themselves
CREATE POLICY "Users can create their own company"
    ON companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own company
CREATE POLICY "Users can update their own company"
    ON companies FOR UPDATE
    USING (auth.uid() = user_id);

-- CLIENTS TABLE
-- Allow users to view clients belonging to their company
CREATE POLICY "Users can view their own clients"
    ON clients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM companies
            WHERE companies.id = clients.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- Allow users to create clients for their company
CREATE POLICY "Users can create clients for their company"
    ON clients FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM companies
            WHERE companies.id = clients.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- Allow users to update their own clients
CREATE POLICY "Users can update their own clients"
    ON clients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM companies
            WHERE companies.id = clients.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- Allow users to delete their own clients
CREATE POLICY "Users can delete their own clients"
    ON clients FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM companies
            WHERE companies.id = clients.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- INVOICES TABLE
-- Allow users to view their own invoices
CREATE POLICY "Users can view their own invoices"
    ON invoices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM companies
            WHERE companies.id = invoices.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- Allow users to create invoices for their company
CREATE POLICY "Users can create invoices for their company"
    ON invoices FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM companies
            WHERE companies.id = invoices.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- Allow users to update their own invoices
CREATE POLICY "Users can update their own invoices"
    ON invoices FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM companies
            WHERE companies.id = invoices.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- Allow users to delete their own invoices
CREATE POLICY "Users can delete their own invoices"
    ON invoices FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM companies
            WHERE companies.id = invoices.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- INVOICE_ITEMS TABLE  
-- Allow users to view invoice items for their invoices
CREATE POLICY "Users can view invoice items for their invoices"
    ON invoice_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            JOIN companies ON companies.id = invoices.company_id
            WHERE invoices.id = invoice_items.invoice_id
            AND companies.user_id = auth.uid()
        )
    );

-- Allow users to create invoice items for their invoices
CREATE POLICY "Users can create invoice items for their invoices"
    ON invoice_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices
            JOIN companies ON companies.id = invoices.company_id
            WHERE invoices.id = invoice_items.invoice_id
            AND companies.user_id = auth.uid()
        )
    );

-- Allow users to update invoice items for their invoices
CREATE POLICY "Users can update invoice items for their invoices"
    ON invoice_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            JOIN companies ON companies.id = invoices.company_id
            WHERE invoices.id = invoice_items.invoice_id
            AND companies.user_id = auth.uid()
        )
    );

-- Allow users to delete invoice items for their invoices
CREATE POLICY "Users can delete invoice items for their invoices"
    ON invoice_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            JOIN companies ON companies.id = invoices.company_id
            WHERE invoices.id = invoice_items.invoice_id
            AND companies.user_id = auth.uid()
        )
    );
