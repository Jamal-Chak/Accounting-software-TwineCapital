-- Migration: Add documents table
-- Description: Creates the documents table for file management and linking

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    size BIGINT NOT NULL DEFAULT 0,
    type TEXT NOT NULL,
    folder TEXT NOT NULL DEFAULT 'General',
    entity_type TEXT, -- e.g., 'invoice', 'bill', 'project'
    entity_id UUID, -- ID of the linked record
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);

-- Add RLS policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY documents_select_policy ON documents FOR SELECT USING (true);
CREATE POLICY documents_insert_policy ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY documents_update_policy ON documents FOR UPDATE USING (true);
CREATE POLICY documents_delete_policy ON documents FOR DELETE USING (true);

-- Storage Bucket Setup (Note: Buckets are usually created via API/Dashboard, but RLS for objects can be set here)
-- We assume a bucket named 'documents' exists.

-- Storage Policies (If using Supabase Storage schema)
-- Allow authenticated uploads to 'documents' bucket
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
-- CREATE POLICY "Allow authenticated reads" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
