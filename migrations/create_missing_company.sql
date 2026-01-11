-- =====================================================
-- FIX: Create company for current user if missing
-- =====================================================

-- First, check if user has a company
SELECT 
    u.id as user_id,
    u.email,
    c.id as company_id,
    c.name as company_name
FROM auth.users u
LEFT JOIN companies c ON c.user_id = u.id
WHERE u.email = 'testtrialtester@gmail.com'; -- Replace with actual user email

-- If no company exists, create one
-- Replace 'USER_ID_HERE' with the actual user ID from the query above
INSERT INTO companies (user_id, name, country, currency, vat_number, settings)
VALUES (
    'USER_ID_HERE',  -- Replace with actual user ID
    'My Company',
    'South Africa',
    'ZAR',
    '',
    '{}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Verify company was created
SELECT id, user_id, name, country, currency
FROM companies
WHERE user_id = 'USER_ID_HERE';  -- Replace with actual user ID
