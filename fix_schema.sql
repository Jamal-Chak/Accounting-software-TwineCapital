-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    vat_number TEXT,
    country TEXT DEFAULT 'South Africa',
    currency TEXT DEFAULT 'ZAR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    tax_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank connections table
CREATE TABLE IF NOT EXISTS bank_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    bank_name TEXT CHECK (bank_name IN ('fnb', 'standard-bank', 'absa', 'nedbank', 'capitec')) NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT,
    access_token TEXT,
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bank_connection_id UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    merchant TEXT,
    category TEXT,
    is_reconciled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    total_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    vendor TEXT,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'reimbursed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_connection_id ON transactions(bank_connection_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_company_id ON bank_connections(company_id);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies (using DO block to avoid errors if they exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Users can view their own companies') THEN
        CREATE POLICY "Users can view their own companies" ON companies FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Users can insert their own companies') THEN
        CREATE POLICY "Users can insert their own companies" ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Users can update their own companies') THEN
        CREATE POLICY "Users can update their own companies" ON companies FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Clients policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can view clients for their companies') THEN
        CREATE POLICY "Users can view clients for their companies" ON clients FOR SELECT USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can insert clients for their companies') THEN
        CREATE POLICY "Users can insert clients for their companies" ON clients FOR INSERT WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
    END IF;

    -- Expenses policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Users can view expenses for their companies') THEN
        CREATE POLICY "Users can view expenses for their companies" ON expenses FOR SELECT USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Users can insert expenses for their companies') THEN
        CREATE POLICY "Users can insert expenses for their companies" ON expenses FOR INSERT WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Users can update expenses for their companies') THEN
        CREATE POLICY "Users can update expenses for their companies" ON expenses FOR UPDATE USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
    END IF;
    
    -- Invoices policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users can view invoices for their companies') THEN
        CREATE POLICY "Users can view invoices for their companies" ON invoices FOR SELECT USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users can insert invoices for their companies') THEN
        CREATE POLICY "Users can insert invoices for their companies" ON invoices FOR INSERT WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
    END IF;
END
$$;

-- Insert sample data if tables are empty (optional, but helpful for demo)
INSERT INTO expenses (company_id, description, amount, category, date, vendor, tax_rate, tax_amount, total_amount, status) 
SELECT '00000000-0000-0000-0000-000000000000', 'Office Supplies - Stationery', 250.00, 'Office Supplies', '2025-11-15', 'Office Depot', 15.00, 37.50, 287.50, 'approved'
WHERE NOT EXISTS (SELECT 1 FROM expenses LIMIT 1);
