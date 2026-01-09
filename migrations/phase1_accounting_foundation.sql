-- ============================================
-- Phase 1: MVP Foundations - Database Schema
-- TwineCapital Double-Entry Accounting System
-- ============================================

-- ========== CHART OF ACCOUNTS ==========
-- Core table for double-entry bookkeeping
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  parent_id UUID REFERENCES accounts(id),
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE INDEX idx_accounts_company ON accounts(company_id);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_accounts_parent ON accounts(parent_id);

COMMENT ON TABLE accounts IS 'Chart of accounts for double-entry bookkeeping';
COMMENT ON COLUMN accounts.type IS 'Account type: Asset, Liability, Equity, Revenue, Expense';

-- ========== JOURNAL SYSTEM ==========
-- Main journal entries table
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  journal_date DATE NOT NULL,
  memo TEXT,
  source VARCHAR(50), -- 'invoice', 'payment', 'bill', 'expense', 'manual'
  source_id UUID, -- reference to invoice/payment/bill/expense
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_journals_company ON journals(company_id);
CREATE INDEX idx_journals_date ON journals(journal_date);
CREATE INDEX idx_journals_source ON journals(source, source_id);

-- Journal lines (debits and credits)
CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  debit DECIMAL(15,2) DEFAULT 0 CHECK (debit >= 0),
  credit DECIMAL(15,2) DEFAULT 0 CHECK (credit >= 0),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT balanced_line CHECK (debit = 0 OR credit = 0) -- One must be zero
);

CREATE INDEX idx_journal_lines_journal ON journal_lines(journal_id);
CREATE INDEX idx_journal_lines_account ON journal_lines(account_id);

COMMENT ON TABLE journals IS 'Journal entries for all financial transactions';
COMMENT ON TABLE journal_lines IS 'Individual debit/credit lines for journal entries';
COMMENT ON CONSTRAINT balanced_line ON journal_lines IS 'Ensures each line is either debit OR credit, not both';

-- ========== TAX RATES ==========
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  rate DECIMAL(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  jurisdiction VARCHAR(100),
  is_inclusive BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE INDEX idx_tax_rates_company ON tax_rates(company_id);

COMMENT ON TABLE tax_rates IS 'VAT/Tax rates configuration';
COMMENT ON COLUMN tax_rates.is_inclusive IS 'True if tax is included in price, false if added on top';

-- ========== PAYMENTS ==========
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  bill_id UUID REFERENCES bills(id),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  method VARCHAR(50), -- 'cash', 'bank_transfer', 'credit_card', 'paypal', etc.
  reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT payment_entity CHECK (
    (invoice_id IS NOT NULL AND bill_id IS NULL) OR 
    (invoice_id IS NULL AND bill_id IS NOT NULL)
  )
);

CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_bill ON payments(bill_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

COMMENT ON TABLE payments IS 'Payment records for invoices and bills';
COMMENT ON CONSTRAINT payment_entity ON payments IS 'Payment must be for either invoice OR bill, not both';

-- ========== ENHANCE INVOICES TABLE ==========
-- Add missing columns for proper invoice management
DO $$ 
BEGIN
  -- Add balance column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='invoices' AND column_name='balance') THEN
    ALTER TABLE invoices ADD COLUMN balance DECIMAL(15,2);
  END IF;
  
  -- Add pdf_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='invoices' AND column_name='pdf_url') THEN
    ALTER TABLE invoices ADD COLUMN pdf_url TEXT;
  END IF;
  
  -- Add sent_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='invoices' AND column_name='sent_at') THEN
    ALTER TABLE invoices ADD COLUMN sent_at TIMESTAMP;
  END IF;

  -- Initialize balance to total_amount for existing invoices
  UPDATE invoices SET balance = total_amount WHERE balance IS NULL;
END $$;

-- ========== INVOICE LINES ==========
-- Enhanced invoice lines with tax calculation
CREATE TABLE IF NOT EXISTS invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES items(id),
  description TEXT NOT NULL,
  quantity DECIMAL(15,4) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(15,2) NOT NULL,
  discount DECIMAL(15,2) DEFAULT 0 CHECK (discount >= 0),
  tax_rate_id UUID REFERENCES tax_rates(id),
  line_total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX idx_invoice_lines_product ON invoice_lines(product_id);

COMMENT ON TABLE invoice_lines IS 'Line items for invoices with tax calculation support';

-- ========== DEFAULT CHART OF ACCOUNTS ==========
-- Insert standard South African chart of accounts for demo/new companies
-- This will be used as a template

CREATE TABLE IF NOT EXISTS default_accounts (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  parent_code VARCHAR(20),
  description TEXT
);

-- Insert standard account structure
INSERT INTO default_accounts (code, name, type, parent_code, description) VALUES
-- Assets
('1000', 'Assets', 'Asset', NULL, 'All company assets'),
('1100', 'Current Assets', 'Asset', '1000', 'Assets convertible to cash within 1 year'),
('1110', 'Cash and Bank', 'Asset', '1100', 'Cash on hand and in bank accounts'),
('1120', 'Accounts Receivable', 'Asset', '1100', 'Money owed by customers'),
('1200', 'Fixed Assets', 'Asset', '1000', 'Long-term tangible assets'),

-- Liabilities
('2000', 'Liabilities', 'Liability', NULL, 'All company liabilities'),
('2100', 'Current Liabilities', 'Liability', '2000', 'Debts due within 1 year'),
('2110', 'Accounts Payable', 'Liability', '2100', 'Money owed to suppliers'),
('2120', 'VAT Payable', 'Liability', '2100', 'VAT owed to SARS'),

-- Equity
('3000', 'Equity', 'Equity', NULL, 'Owner equity'),
('3100', 'Retained Earnings', 'Equity', '3000', 'Accumulated profits'),

-- Revenue
('4000', 'Revenue', 'Revenue', NULL, 'All income'),
('4100', 'Sales Revenue', 'Revenue', '4000', 'Revenue from sales'),
('4200', 'Other Income', 'Revenue', '4000', 'Non-operating income'),

-- Expenses
('5000', 'Expenses', 'Expense', NULL, 'All expenses'),
('5100', 'Cost of Sales', 'Expense', '5000', 'Direct costs of goods/services sold'),
('5200', 'Operating Expenses', 'Expense', '5000', 'General business expenses'),
('5210', 'Rent', 'Expense', '5200', 'Office/premises rent'),
('5220', 'Utilities', 'Expense', '5200', 'Electricity, water, internet'),
('5230', 'Office Supplies', 'Expense', '5200', 'Stationery and supplies'),

-- VAT accounts
('2130', 'VAT Output', 'Liability', '2100', 'VAT collected from customers'),
('1130', 'VAT Input', 'Asset', '1100', 'VAT paid to suppliers')
ON CONFLICT (code) DO NOTHING;

-- ========== FUNCTIONS ==========

-- Function to initialize chart of accounts for a new company
CREATE OR REPLACE FUNCTION initialize_chart_of_accounts(company_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO accounts (company_id, code, name, type, description)
  SELECT 
    company_uuid,
    code,
    name,
    type,
    description
  FROM default_accounts
  ON CONFLICT (company_id, code) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to validate journal balance
CREATE OR REPLACE FUNCTION validate_journal_balance(journal_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  total_debits DECIMAL(15,2);
  total_credits DECIMAL(15,2);
BEGIN
  SELECT 
    COALESCE(SUM(debit), 0),
    COALESCE(SUM(credit), 0)
  INTO total_debits, total_credits
  FROM journal_lines
  WHERE journal_id = journal_uuid;
  
  RETURN ABS(total_debits - total_credits) < 0.01; -- Allow for rounding
END;
$$ LANGUAGE plpgsql;

-- ========== ROW LEVEL SECURITY ==========
-- Enable RLS on new tables

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;

-- Policies for accounts (users can only see their company's accounts)
CREATE POLICY accounts_company_isolation ON accounts
  FOR ALL
  USING (company_id IN (
    SELECT id FROM companies 
    WHERE user_id = auth.uid() OR id = '22222222-2222-2222-2222-222222222222'
  ));

-- Policies for journals
CREATE POLICY journals_company_isolation ON journals
  FOR ALL
  USING (company_id IN (
    SELECT id FROM companies 
    WHERE user_id = auth.uid() OR id = '22222222-2222-2222-2222-222222222222'
  ));

-- Policies for journal_lines (through journal)
CREATE POLICY journal_lines_access ON journal_lines
  FOR ALL
  USING (journal_id IN (
    SELECT id FROM journals 
    WHERE company_id IN (
      SELECT id FROM companies 
      WHERE user_id = auth.uid() OR id = '22222222-2222-2222-2222-222222222222'
    )
  ));

-- Policies for tax_rates
CREATE POLICY tax_rates_company_isolation ON tax_rates
  FOR ALL
  USING (company_id IN (
    SELECT id FROM companies 
    WHERE user_id = auth.uid() OR id = '22222222-2222-2222-2222-222222222222'
  ));

-- Policies for payments
CREATE POLICY payments_company_isolation ON payments
  FOR ALL
  USING (company_id IN (
    SELECT id FROM companies 
    WHERE user_id = auth.uid() OR id = '22222222-2222-2222-2222-222222222222'
  ));

-- Policies for invoice_lines
CREATE POLICY invoice_lines_access ON invoice_lines
  FOR ALL
  USING (invoice_id IN (
    SELECT id FROM invoices 
    WHERE company_id IN (
      SELECT id FROM companies 
      WHERE user_id = auth.uid() OR id = '22222222-2222-2222-2222-222222222222'
    )
  ));

-- ========== COMPLETION MESSAGE ==========
DO $$
BEGIN
  RAISE NOTICE 'Phase 1 database schema created successfully!';
  RAISE NOTICE 'Tables created: accounts, journals, journal_lines, tax_rates, payments, invoice_lines';
  RAISE NOTICE 'Use initialize_chart_of_accounts(company_id) to set up accounts for a company';
END $$;
