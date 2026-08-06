-- Lookbook items table for admin-managed gallery
create table if not exists lookbook_items (
  id uuid default gen_random_uuid() primary key,
  src text not null,
  alt text not null default '',
  span text not null default '', -- '' or 'row-span-2' for masonry layout
  sort_order int not null default 0,
  active boolean default true,
  created_at timestamptz default now()
);

alter table lookbook_items enable row level security;

create policy "Anyone can read active lookbook items"
  on lookbook_items for select using (active = true);

create policy "Authenticated admin can manage lookbook"
  on lookbook_items for all using (auth.role() = 'authenticated');

-- Seed with the existing hardcoded photos
insert into lookbook_items (src, alt, span, sort_order) values
  ('https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800', 'Street style sneakers', 'row-span-2', 1),
  ('https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', 'Running shoes on track', '', 2),
  ('https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', 'Lifestyle sneakers', '', 3),
  ('https://images.pexels.com/photos/3316924/pexels-photo-3316924.jpeg?auto=compress&cs=tinysrgb&w=800', 'Athletic shoes in motion', 'row-span-2', 4),
  ('https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800', 'Casual shoe style', '', 5),
  ('https://images.pexels.com/photos/2562992/pexels-photo-2562992.png?auto=compress&cs=tinysrgb&w=800', 'Outdoor shoes', '', 6),
  ('https://images.pexels.com/photos/1082528/pexels-photo-1082528.jpeg?auto=compress&cs=tinysrgb&w=800', 'Fashion sneakers on feet', 'row-span-2', 7),
  ('https://images.pexels.com/photos/1546003/pexels-photo-1546003.jpeg?auto=compress&cs=tinysrgb&w=800', 'White sneakers closeup', '', 8),
  ('https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=800', 'Colorful shoes collection', '', 9);
