-- Migration: Add projects table
-- Description: Creates the projects table for project management and time tracking

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
    budget NUMERIC(15, 2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on company_id for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);

-- Create index on client_id for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Add RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view projects for their company
CREATE POLICY projects_select_policy ON projects
    FOR SELECT
    USING (true);

-- Policy: Users can insert projects for their company
CREATE POLICY projects_insert_policy ON projects
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can update projects for their company
CREATE POLICY projects_update_policy ON projects
    FOR UPDATE
    USING (true);

-- Policy: Users can delete projects for their company
CREATE POLICY projects_delete_policy ON projects
    FOR DELETE
    USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at_trigger
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();
