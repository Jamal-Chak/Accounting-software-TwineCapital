-- Fix/Ensure Chart of Accounts
-- This script ensures the default accounts exist and can be used for initialization

-- Create the default_accounts table if it doesn't exist (it should from phase1, but let's be safe)
CREATE TABLE IF NOT EXISTS default_accounts (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  parent_code VARCHAR(20),
  description TEXT
);

-- Insert or Update standard account structure
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
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    parent_code = EXCLUDED.parent_code,
    description = EXCLUDED.description;

-- Function to initialize chart of accounts for a new company (idempotent)
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
