-- Migration: Add timesheets table
-- Description: Creates the timesheets table for tracking time against projects

CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    user_id UUID, -- Nullable for now, would link to auth.users in a real app
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration NUMERIC(5, 2) NOT NULL DEFAULT 0, -- Duration in hours
    description TEXT NOT NULL,
    billable BOOLEAN DEFAULT true,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_timesheets_company_id ON timesheets(company_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_project_id ON timesheets(project_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_date ON timesheets(date);
CREATE INDEX IF NOT EXISTS idx_timesheets_user_id ON timesheets(user_id);

-- Add RLS policies
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY timesheets_select_policy ON timesheets FOR SELECT USING (true);
CREATE POLICY timesheets_insert_policy ON timesheets FOR INSERT WITH CHECK (true);
CREATE POLICY timesheets_update_policy ON timesheets FOR UPDATE USING (true);
CREATE POLICY timesheets_delete_policy ON timesheets FOR DELETE USING (true);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER timesheets_updated_at_trigger
    BEFORE UPDATE ON timesheets
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();
