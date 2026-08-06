-- Reviews table for product ratings and written reviews
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  reviewer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table reviews enable row level security;

create policy "Anyone can read reviews"
  on reviews for select using (true);

create policy "Anyone can insert a review"
  on reviews for insert with check (true);

-- Stock notifications table for back-in-stock alerts
create table if not exists stock_notifications (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  email text not null,
  notified boolean default false,
  created_at timestamptz default now(),
  unique(product_id, email)
);

alter table stock_notifications enable row level security;

create policy "Anyone can insert a stock notification"
  on stock_notifications for insert with check (true);

create policy "Admin can read stock notifications"
  on stock_notifications for select using (auth.role() = 'authenticated');
