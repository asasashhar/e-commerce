/*
# Secure orders table for admin access

1. Security Changes
- Drop the existing anon SELECT policy on `orders` — customers should NOT be able to read all orders.
- Add an authenticated-only SELECT policy so admin users can view orders.
- Add an authenticated-only UPDATE policy so admins can change order status.
- Keep the anon INSERT policy so customers can place orders without logging in.
- Remove UPDATE/DELETE grants from anon role on orders.
*/

-- Drop old anon select policy
DROP POLICY IF EXISTS "anon_select_orders" ON orders;

-- Authenticated admins can view all orders
CREATE POLICY "admin_select_orders" ON orders FOR SELECT
  TO authenticated USING (true);

-- Authenticated admins can update order status
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Revoke update/delete from anon (anon keeps select+insert via policies, but we lock the grants)
REVOKE UPDATE, DELETE ON orders FROM anon;
