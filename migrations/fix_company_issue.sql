-- Quick fix for Items not saving
-- Run this in Supabase SQL Editor

-- Check if companies exist
SELECT COUNT(*) as company_count FROM companies;

-- If no companies, create a demo company
INSERT INTO companies (id, user_id, name, vat_number, country, currency)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'Demo Company SA',
    'VAT123456789',
    'South Africa',
    'ZAR'
)
ON CONFLICT (id) DO NOTHING;

-- Verify the company was created
SELECT * FROM companies;

-- Test inserting an item manually
INSERT INTO items (company_id, name, description, unit_price, tax_rate, category, sku)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Test Item',
    'This is a test',
    100.00,
    15.00,
    'product',
    'TEST001'
);

-- Check if item was inserted
SELECT * FROM items;
