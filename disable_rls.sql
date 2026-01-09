-- Disable Row Level Security (RLS) for all tables
-- This allows the demo app to work without requiring user authentication

ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- Also drop the restrictive policies to be clean (optional, but good practice)
DROP POLICY IF EXISTS "Users can view their own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert their own companies" ON companies;
DROP POLICY IF EXISTS "Users can update their own companies" ON companies;

DROP POLICY IF EXISTS "Users can view clients for their companies" ON clients;
DROP POLICY IF EXISTS "Users can insert clients for their companies" ON clients;

DROP POLICY IF EXISTS "Users can view expenses for their companies" ON expenses;
DROP POLICY IF EXISTS "Users can insert expenses for their companies" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses for their companies" ON expenses;

DROP POLICY IF EXISTS "Users can view invoices for their companies" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices for their companies" ON invoices;
