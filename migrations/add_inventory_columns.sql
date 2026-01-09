
-- Add inventory columns to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 10;
