-- =====================================================
-- FIX: Add missing RLS policy for companies table
-- =====================================================

-- The companies table needs a SELECT policy so users can read their own company
DROP POLICY IF EXISTS "Users can view own company" ON companies;
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own company" ON companies;
CREATE POLICY "Users can update own company" ON companies
  FOR UPDATE USING (user_id = auth.uid());

-- Verify the policy was created
SELECT policyname, cmd as operation
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'companies';
