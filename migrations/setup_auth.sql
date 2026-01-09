-- TwineCapital Authentication Setup
-- Run this in Supabase SQL Editor to ensure proper database configuration

-- ============================================
-- 1. Create Companies Table (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    country TEXT DEFAULT 'South Africa',
    currency TEXT DEFAULT 'ZAR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Enable Row Level Security
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Drop existing policies (if any)
-- ============================================

DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can insert own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;
DROP POLICY IF EXISTS "Users can delete own company" ON companies;

-- ============================================
-- 4. Create RLS Policies
-- ============================================

-- Allow users to view their own company
CREATE POLICY "Users can view own company" ON companies
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow users to insert their own company
CREATE POLICY "Users can insert own company" ON companies
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own company
CREATE POLICY "Users can update own company" ON companies
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own company
CREATE POLICY "Users can delete own company" ON companies
    FOR DELETE 
    USING (auth.uid() = user_id);

-- ============================================
-- 5. Create index for better query performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_companies_user_id 
    ON companies(user_id);

-- ============================================
-- 6. Verify Setup
-- ============================================

-- Check if table exists
SELECT 
    'companies' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
    ) as exists;

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'companies';

-- Check policies
SELECT 
    policyname,
    cmd as command,
    qual as using_clause
FROM pg_policies 
WHERE tablename = 'companies';

-- ============================================
-- COMPLETE! 
-- ============================================
-- Your database is now ready for authentication
-- You can now signup/login in your application
