-- Lookbook items table
create table if not exists lookbook_items (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  alt_text text not null,
  span text default '',
  created_at timestamptz default now()
);

alter table lookbook_items enable row level security;

create policy "Anyone can read lookbook items"
  on lookbook_items for select using (true);

create policy "Admin can insert lookbook items"
  on lookbook_items for insert with check (auth.role() = 'authenticated');

create policy "Admin can update lookbook items"
  on lookbook_items for update using (auth.role() = 'authenticated');

create policy "Admin can delete lookbook items"
  on lookbook_items for delete using (auth.role() = 'authenticated');

-- Insert default lookbook items
insert into lookbook_items (image_url, alt_text, span) values
('https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800', 'Street style sneakers', 'row-span-2'),
('https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', 'Running shoes on track', ''),
('https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', 'Lifestyle sneakers', ''),
('https://images.pexels.com/photos/3316924/pexels-photo-3316924.jpeg?auto=compress&cs=tinysrgb&w=800', 'Athletic shoes in motion', 'row-span-2'),
('https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800', 'Casual shoe style', ''),
('https://images.pexels.com/photos/2562992/pexels-photo-2562992.png?auto=compress&cs=tinysrgb&w=800', 'Outdoor shoes', ''),
('https://images.pexels.com/photos/1082528/pexels-photo-1082528.jpeg?auto=compress&cs=tinysrgb&w=800', 'Fashion sneakers on feet', 'row-span-2'),
('https://images.pexels.com/photos/1546003/pexels-photo-1546003.jpeg?auto=compress&cs=tinysrgb&w=800', 'White sneakers closeup', ''),
('https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=800', 'Colorful shoes collection', '')
on conflict do nothing;
