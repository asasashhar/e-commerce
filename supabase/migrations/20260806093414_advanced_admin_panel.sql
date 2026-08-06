/*
# Advanced admin panel: product gallery, settings, discounts, product CRUD

1. Modified Tables
- `products`: add `gallery` (jsonb array of image URLs) for multiple product images
- `orders`: add `discount_code` (text) and `discount_amount` (numeric) for applied discounts

2. New Tables
- `settings` (single-row): stores shop-wide configuration
  - id (int, pk, always 1)
  - shop_name (text)
  - shop_email (text)
  - shop_phone (text)
  - shop_address (text)
  - about_title (text)
  - about_description (text)
  - about_image (text)
  - free_shipping_threshold (numeric)
  - tax_rate (numeric)
  - updated_at (timestamp)
- `discounts`: discount codes creatable by admin
  - id (uuid, pk)
  - code (text, unique) — the promo code customers enter
  - description (text)
  - type (text) — 'percentage' or 'fixed'
  - value (numeric) — percentage (0-100) or fixed dollar amount
  - active (boolean, default true)
  - expires_at (timestamp, nullable)
  - created_at (timestamp)

3. Security
- `products`: keep anon SELECT (public catalog); add authenticated INSERT/UPDATE/DELETE (admin CRUD)
- `orders`: keep anon INSERT; keep authenticated SELECT/UPDATE; add authenticated DELETE
- `settings`: anon SELECT (storefront reads settings); authenticated SELECT/UPDATE (admin edits)
- `discounts`: anon SELECT (storefront validates codes); authenticated INSERT/UPDATE/DELETE (admin manages)

4. Notes
- The `settings` table uses a fixed id of 1 (singleton row). A default row is inserted.
- All admin write policies are scoped to `authenticated` only, so only logged-in admins can modify data.
*/

-- Add gallery column to products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gallery') THEN
    ALTER TABLE products ADD COLUMN gallery jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add discount columns to orders
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_code') THEN
    ALTER TABLE orders ADD COLUMN discount_code text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount') THEN
    ALTER TABLE orders ADD COLUMN discount_amount numeric(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create settings table (singleton)
CREATE TABLE IF NOT EXISTS settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shop_name text NOT NULL DEFAULT 'STRIDE',
  shop_email text NOT NULL DEFAULT 'hello@stride.com',
  shop_phone text NOT NULL DEFAULT '+1 (555) 010-2030',
  shop_address text NOT NULL DEFAULT '123 Performance Ave, New York, NY 10001',
  about_title text NOT NULL DEFAULT 'Crafted For Every Move',
  about_description text NOT NULL DEFAULT 'We obsess over every detail so you don''t have to. From lab to street, our shoes are built to perform and designed to turn heads.',
  about_image text,
  free_shipping_threshold numeric(10,2) NOT NULL DEFAULT 99,
  tax_rate numeric(5,4) NOT NULL DEFAULT 0.08,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_settings" ON settings;
CREATE POLICY "admin_update_settings" ON settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Insert default settings row
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  value numeric(10,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_discounts" ON discounts;
CREATE POLICY "anon_select_discounts" ON discounts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_discounts" ON discounts;
CREATE POLICY "admin_insert_discounts" ON discounts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_discounts" ON discounts;
CREATE POLICY "admin_update_discounts" ON discounts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_discounts" ON discounts;
CREATE POLICY "admin_delete_discounts" ON discounts FOR DELETE
  TO authenticated USING (true);

-- Add admin CRUD policies to products
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- Add admin delete policy to orders
DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
