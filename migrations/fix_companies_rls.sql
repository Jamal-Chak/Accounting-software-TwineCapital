
-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to cleanly recreate
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can insert own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;

-- Allow users to SELECT their own company
CREATE POLICY "Users can view own company" ON companies
    FOR SELECT
    USING (user_id = auth.uid());

-- Allow users to INSERT a company for themselves
CREATE POLICY "Users can insert own company" ON companies
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Allow users to UPDATE their own company
CREATE POLICY "Users can update own company" ON companies
    FOR UPDATE
    USING (user_id = auth.uid());
