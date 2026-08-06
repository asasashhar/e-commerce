/*
# Create shoe store tables (single-tenant, no auth)

1. New Tables
- `products`: catalog of shoes for sale
  - id (uuid, pk)
  - name (text) - shoe model name
  - brand (text) - brand name
  - description (text) - product description
  - price (numeric) - price in USD
  - image_url (text) - main product image
  - colors (jsonb) - array of available color names with hex codes
  - sizes (jsonb) - array of available sizes
  - category (text) - e.g. "Running", "Lifestyle", "Basketball"
  - rating (numeric) - average rating 0-5
  - reviews (integer) - number of reviews
  - badge (text) - optional badge like "New", "Bestseller"
  - featured (boolean) - show in hero/featured section
  - in_stock (boolean) - availability
  - created_at (timestamp)
- `orders`: customer orders
  - id (uuid, pk)
  - customer_name (text)
  - customer_email (text)
  - shipping_address (text)
  - items (jsonb) - array of {product_id, name, size, color, qty, price}
  - total (numeric)
  - status (text) default 'pending'
  - created_at (timestamp)

2. Security
- Enable RLS on both tables.
- Products: allow anon + authenticated read-only (public catalog).
- Orders: allow anon + authenticated insert + read (no auth flow in this app).
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL DEFAULT 'STRIDE',
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  image_url text NOT NULL,
  colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text NOT NULL DEFAULT 'Lifestyle',
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  reviews integer NOT NULL DEFAULT 0,
  badge text,
  featured boolean NOT NULL DEFAULT false,
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  shipping_address text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Seed product catalog
INSERT INTO products (name, brand, description, price, image_url, colors, sizes, category, rating, reviews, badge, featured, in_stock) VALUES
(
  'Aero Pulse Pro',
  'STRIDE',
  'Engineered for speed. The Aero Pulse Pro features a responsive carbon plate and ultra-light knit upper for explosive energy return on every stride.',
  189.00,
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Electric Blue","hex":"#2563eb"},{"name":"Crimson","hex":"#dc2626"},{"name":"Carbon","hex":"#1f2937"}]'::jsonb,
  '["7","7.5","8","8.5","9","9.5","10","10.5","11","12"]'::jsonb,
  'Running',
  4.8,
  327,
  'Bestseller',
  true,
  true
),
(
  'Cloud Drifter',
  'STRIDE',
  'All-day comfort meets street style. The Cloud Drifter uses a plush foam midsole and breathable mesh upper for a weightless feel from morning to night.',
  145.00,
  'https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Cloud White","hex":"#f3f4f6"},{"name":"Sage","hex":"#84cc16"},{"name":"Slate","hex":"#475569"}]'::jsonb,
  '["6","6.5","7","7.5","8","8.5","9","9.5","10","11"]'::jsonb,
  'Lifestyle',
  4.6,
  214,
  'New',
  true,
  true
),
(
  'Velocity Knight',
  'STRIDE',
  'Dominate the court. The Velocity Knight wraps a high-top silhouette around a full-length air unit for maximum impact protection and ankle support.',
  220.00,
  'https://images.pexels.com/photos/5413290/pexels-photo-5413290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Forest","hex":"#16a34a"},{"name":"Carbon","hex":"#1f2937"},{"name":"Solar","hex":"#f59e0b"}]'::jsonb,
  '["7","8","9","10","11","12","13"]'::jsonb,
  'Basketball',
  4.9,
  512,
  'Bestseller',
  true,
  true
),
(
  'Midnight Runner',
  'STRIDE',
  'Sleek low-profile design with a premium leather upper. The Midnight Runner transitions seamlessly from the track to a night out.',
  175.00,
  'https://images.pexels.com/photos/20755674/pexels-photo-20755674.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Midnight","hex":"#1e3a8a"},{"name":"Bone","hex":"#f5f5dc"},{"name":"Carbon","hex":"#1f2937"}]'::jsonb,
  '["7","7.5","8","8.5","9","9.5","10","10.5","11","12"]'::jsonb,
  'Lifestyle',
  4.7,
  189,
  NULL,
  false,
  true
),
(
  'Phantom Surge',
  'STRIDE',
  'Stealth meets performance. The Phantom Surge features a blacked-out knit upper with reflective accents and a spring-loaded midsole.',
  205.00,
  'https://images.pexels.com/photos/11559288/pexels-photo-11559288.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Phantom","hex":"#111827"},{"name":"Volt","hex":"#84cc16"},{"name":"Crimson","hex":"#dc2626"}]'::jsonb,
  '["7","7.5","8","8.5","9","9.5","10","10.5","11","12"]'::jsonb,
  'Running',
  4.8,
  401,
  'New',
  false,
  true
),
(
  'Retro Glide',
  'STRIDE',
  'Throwback style with modern comfort. The Retro Glide blends vintage lines with a cushioned ortholite insole for everyday wear.',
  135.00,
  'https://images.pexels.com/photos/30313904/pexels-photo-30313904.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Sand","hex":"#d4a574"},{"name":"Rust","hex":"#c2410c"},{"name":"Bone","hex":"#f5f5dc"}]'::jsonb,
  '["6","6.5","7","7.5","8","8.5","9","9.5","10","11"]'::jsonb,
  'Lifestyle',
  4.5,
  156,
  NULL,
  false,
  true
),
(
  'Apex Flare',
  'STRIDE',
  'Bold color blocking for the bold at heart. The Apex Flarge turns heads with its vibrant panels and lightweight cushioned ride.',
  165.00,
  'https://images.pexels.com/photos/14525666/pexels-photo-14525666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Cobalt","hex":"#2563eb"},{"name":"Coral","hex":"#fb7185"},{"name":"Carbon","hex":"#1f2937"}]'::jsonb,
  '["7","7.5","8","8.5","9","9.5","10","10.5","11","12"]'::jsonb,
  'Running',
  4.7,
  233,
  NULL,
  false,
  true
),
(
  'Trail Blazer X',
  'STRIDE',
  'Conquer any terrain. The Trail Blazer X features an aggressive lug pattern, waterproof membrane, and rock-shield plate for the outdoors.',
  195.00,
  'https://images.pexels.com/photos/16918373/pexels-photo-16918373.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  '[{"name":"Arctic","hex":"#3b82f6"},{"name":"Forest","hex":"#16a34a"},{"name":"Carbon","hex":"#1f2937"}]'::jsonb,
  '["7","8","9","10","11","12","13"]'::jsonb,
  'Trail',
  4.8,
  178,
  'Bestseller',
  false,
  true
)
ON CONFLICT DO NOTHING;
