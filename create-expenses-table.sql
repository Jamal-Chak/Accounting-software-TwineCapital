-- Create expenses table if it doesn't exist
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    vendor TEXT,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'reimbursed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expenses
CREATE POLICY "Users can view expenses for their companies" ON expenses
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert expenses for their companies" ON expenses
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update expenses for their companies" ON expenses
    FOR UPDATE USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

-- Insert sample expenses for demo purposes
INSERT INTO expenses (company_id, description, amount, category, date, vendor, tax_rate, tax_amount, total_amount, status) VALUES
('00000000-0000-0000-0000-000000000000', 'Office Supplies - Stationery', 250.00, 'Office Supplies', '2025-11-15', 'Office Depot', 15.00, 37.50, 287.50, 'approved'),
('00000000-0000-0000-0000-000000000000', 'Software Subscription - Design Tools', 750.00, 'Software', '2025-11-10', 'Adobe Creative Cloud', 15.00, 112.50, 862.50, 'pending'),
('00000000-0000-0000-0000-000000000000', 'Business Lunch - Client Meeting', 180.00, 'Meals & Entertainment', '2025-11-08', 'The Capital Hotel', 15.00, 27.00, 207.00, 'reimbursed'),
('00000000-0000-0000-0000-000000000000', 'Internet Bill - Telkom', 899.00, 'Utilities', '2025-11-05', 'Telkom', 15.00, 134.85, 1033.85, 'approved'),
('00000000-0000-0000-0000-000000000000', 'Fuel - Company Vehicle', 1200.00, 'Travel', '2025-11-01', 'Shell', 15.00, 180.00, 1380.00, 'pending'),
('00000000-0000-0000-0000-000000000000', 'Professional Development Course', 3500.00, 'Training', '2025-10-28', 'Online Learning Platform', 15.00, 525.00, 4025.00, 'approved')
ON CONFLICT (id) DO NOTHING;
