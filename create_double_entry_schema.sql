-- Double-Entry Accounting Schema

-- 1. Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')) NOT NULL,
    parent_id UUID REFERENCES accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- 2. Journals Table
CREATE TABLE IF NOT EXISTS journals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    journal_date DATE NOT NULL,
    memo TEXT,
    source TEXT CHECK (source IN ('invoice', 'payment', 'bill', 'expense', 'manual')),
    source_id UUID,
    created_by UUID, -- References auth.users if needed, but keeping simple for now
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Journal Lines Table
CREATE TABLE IF NOT EXISTS journal_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_company_id ON accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts(code);
CREATE INDEX IF NOT EXISTS idx_journals_company_id ON journals(company_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON journals(journal_date);
CREATE INDEX IF NOT EXISTS idx_journal_lines_journal_id ON journal_lines(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account_id ON journal_lines(account_id);

-- 5. RLS Policies
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;

-- Accounts Policies
CREATE POLICY "Users can view accounts for their companies" ON accounts
    FOR SELECT USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert accounts for their companies" ON accounts
    FOR INSERT WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update accounts for their companies" ON accounts
    FOR UPDATE USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Journals Policies
CREATE POLICY "Users can view journals for their companies" ON journals
    FOR SELECT USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert journals for their companies" ON journals
    FOR INSERT WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Journal Lines Policies
CREATE POLICY "Users can view journal lines for their companies" ON journal_lines
    FOR SELECT USING (journal_id IN (SELECT id FROM journals WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert journal lines for their companies" ON journal_lines
    FOR INSERT WITH CHECK (journal_id IN (SELECT id FROM journals WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));

-- 6. Initialize Chart of Accounts Function
CREATE OR REPLACE FUNCTION initialize_chart_of_accounts(company_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Assets
    INSERT INTO accounts (company_id, code, name, type, description) VALUES
    (company_uuid, '1110', 'Cash and Bank', 'Asset', 'Cash on hand and bank balances'),
    (company_uuid, '1120', 'Accounts Receivable', 'Asset', 'Money owed by customers'),
    (company_uuid, '1130', 'VAT Input', 'Asset', 'VAT paid on purchases'),
    (company_uuid, '1200', 'Office Equipment', 'Asset', 'Computers, furniture, etc.');

    -- Liabilities
    INSERT INTO accounts (company_id, code, name, type, description) VALUES
    (company_uuid, '2110', 'Accounts Payable', 'Liability', 'Money owed to suppliers'),
    (company_uuid, '2130', 'VAT Output', 'Liability', 'VAT collected on sales'),
    (company_uuid, '2140', 'Payroll Liabilities', 'Liability', 'Wages and taxes payable');

    -- Equity
    INSERT INTO accounts (company_id, code, name, type, description) VALUES
    (company_uuid, '3100', 'Owner''s Equity', 'Equity', 'Capital invested'),
    (company_uuid, '3200', 'Retained Earnings', 'Equity', 'Accumulated profits');

    -- Revenue
    INSERT INTO accounts (company_id, code, name, type, description) VALUES
    (company_uuid, '4100', 'Sales Revenue', 'Revenue', 'Income from sales'),
    (company_uuid, '4200', 'Service Revenue', 'Revenue', 'Income from services');

    -- Expenses
    INSERT INTO accounts (company_id, code, name, type, description) VALUES
    (company_uuid, '5100', 'Cost of Goods Sold', 'Expense', 'Direct costs of items sold'),
    (company_uuid, '5200', 'Operating Expenses', 'Expense', 'General business expenses'),
    (company_uuid, '5210', 'Rent Expense', 'Expense', 'Office rent'),
    (company_uuid, '5220', 'Salaries and Wages', 'Expense', 'Employee compensation'),
    (company_uuid, '5230', 'Marketing', 'Expense', 'Advertising and promotion');
END;
$$ LANGUAGE plpgsql;

-- 7. Execute Raw SQL Function (Required for Reports)
CREATE OR REPLACE FUNCTION execute_raw_sql(sql TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    EXECUTE 'SELECT json_agg(t) FROM (' || sql || ') t' INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
