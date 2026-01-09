ALTER TABLE invoices ADD COLUMN currency text;
ALTER TABLE invoices ADD COLUMN exchange_rate numeric;

ALTER TABLE expenses ADD COLUMN currency text;
ALTER TABLE expenses ADD COLUMN exchange_rate numeric;
