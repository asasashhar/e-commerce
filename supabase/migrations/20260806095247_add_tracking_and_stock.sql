/*
# Add tracking, courier, and stock columns

1. Modified Tables
- `orders`: add `tracking_id` (text, nullable) — courier tracking number
- `orders`: add `courier` (text, nullable) — courier company name
- `products`: add `stock_count` (integer, default 0) — inventory count

2. Security
- No new policies needed. Existing policies cover the new columns since they use column-level grants of "all".
*/

-- Add tracking_id to orders
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_id') THEN
    ALTER TABLE orders ADD COLUMN tracking_id text;
  END IF;
END $$;

-- Add courier to orders
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier') THEN
    ALTER TABLE orders ADD COLUMN courier text;
  END IF;
END $$;

-- Add stock_count to products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_count') THEN
    ALTER TABLE products ADD COLUMN stock_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Backfill stock_count for existing products
UPDATE products SET stock_count = 50 WHERE stock_count = 0;
