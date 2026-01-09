-- Cashflow projections cache
CREATE TABLE IF NOT EXISTS cashflow_projections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    opening_balance DECIMAL(15,2) NOT NULL,
    predicted_inflow DECIMAL(15,2) NOT NULL,
    predicted_outflow DECIMAL(15,2) NOT NULL,
    closing_balance DECIMAL(15,2) NOT NULL,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detected recurring patterns (for analysis)
CREATE TABLE IF NOT EXISTS detected_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    entity_name VARCHAR(255) NOT NULL, -- Vendor or Customer name
    entity_type VARCHAR(50) NOT NULL, -- 'vendor' or 'customer'
    amount DECIMAL(15,2),
    frequency VARCHAR(50), -- 'monthly', 'weekly', etc.
    confidence DECIMAL(3,2),
    last_detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cashflow_company_date ON cashflow_projections(company_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_patterns_company ON detected_patterns(company_id);

-- RLS Policies
ALTER TABLE cashflow_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_patterns ENABLE ROW LEVEL SECURITY;

-- Projections policies
CREATE POLICY cashflow_projections_select ON cashflow_projections
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM company_users WHERE company_id = cashflow_projections.company_id
    ));

CREATE POLICY cashflow_projections_insert ON cashflow_projections
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM company_users WHERE company_id = cashflow_projections.company_id
    ));

CREATE POLICY cashflow_projections_delete ON cashflow_projections
    FOR DELETE USING (auth.uid() IN (
        SELECT user_id FROM company_users WHERE company_id = cashflow_projections.company_id
    ));

-- Patterns policies
CREATE POLICY detected_patterns_select ON detected_patterns
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM company_users WHERE company_id = detected_patterns.company_id
    ));

CREATE POLICY detected_patterns_insert ON detected_patterns
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM company_users WHERE company_id = detected_patterns.company_id
    ));

CREATE POLICY detected_patterns_delete ON detected_patterns
    FOR DELETE USING (auth.uid() IN (
        SELECT user_id FROM company_users WHERE company_id = detected_patterns.company_id
    ));
