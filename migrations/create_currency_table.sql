CREATE TABLE IF NOT EXISTS invoice_currencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'ZAR',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_currencies_invoice_id ON invoice_currencies(invoice_id);
