-- =====================================================
-- RLS VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to check current state
-- =====================================================

-- 1. Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. List all existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check for tables without RLS enabled
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public' 
  AND rowsecurity = false
ORDER BY tablename;

-- 4. Verify companies table policies (should already exist)
SELECT 
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'companies';
