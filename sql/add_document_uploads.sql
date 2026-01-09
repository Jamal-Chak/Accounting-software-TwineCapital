-- Add document_uploads table for AI Document Scanner

-- Create document_uploads table
CREATE TABLE IF NOT EXISTS document_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT NOT NULL,
    ocr_status TEXT CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    raw_text TEXT,
    extracted_data JSONB,
    confidence_score DECIMAL(5,2),
    expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
    review_status TEXT CHECK (review_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_uploads_company_id ON document_uploads(company_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_status ON document_uploads(ocr_status);
CREATE INDEX IF NOT EXISTS idx_document_uploads_expense_id ON document_uploads(expense_id);

-- Enable RLS
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- Policies (We can't rely on DO blocks here with the splitter, so use direct CREATE POLICY. 
-- Note: 'IF NOT EXISTS' for policies is only supported in newer Postgres versions (16+), 
-- or we accept that it might fail if exists. For now, let's just try to create them.
-- If they exist, it will error, which is fine, we can ignore or let user handle.)

-- We will attempt to drop them first to be idempotent-ish for this simple runner? 
-- No, DROP might fail if not exists.
-- Let's just create them. If it fails, the runner stops, which is suboptimal.
-- Better: Use valid SQL that doesn't use DO blocks but handles existence?
-- Actually, the runner parses by ';'.
-- I will just leave the policies out for this run if I can't do DO blocks, OR I will assume the user has a fresh DB for this table.
-- Let's try to add them. If they fail, I'll see the error.

CREATE POLICY "Users can view document uploads for their companies" ON document_uploads FOR SELECT USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert document uploads for their companies" ON document_uploads FOR INSERT WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update document uploads for their companies" ON document_uploads FOR UPDATE USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
