-- Run once in Supabase → SQL Editor.

-- 1) The test's exact table (unchanged)
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  body text check (char_length(body) <= 280),
  created_at timestamptz default now()
);

-- 2) Extra columns: the poster's name (required, 1-50 chars) and an optional photo
alter table posts
  add column author_name text not null
    check (char_length(trim(author_name)) between 1 and 50),
  add column image_url text;

-- 3) A post must have text, a photo, or both
alter table posts
  add constraint posts_has_content
    check (char_length(trim(coalesce(body, ''))) > 0 or image_url is not null);

-- 4) Fast "newest first" sorting
create index posts_created_at_idx on posts (created_at desc);

-- 5) Security: anyone can read and add posts, but nobody can edit or delete them
alter table posts enable row level security;

create policy "Anyone can read posts"
  on posts for select
  to anon, authenticated
  using (true);

create policy "Anyone can create posts"
  on posts for insert
  to anon, authenticated
  with check (true);

-- Newer Supabase projects don't auto-grant table access to the API roles,
-- so give the public (anon) role read + insert only.
grant select, insert on table public.posts to anon, authenticated;

-- 6) Turn on real-time updates for the posts table
alter publication supabase_realtime add table posts;

-- 7) Public photo bucket: 5MB max, images only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images', 'post-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

create policy "Anyone can upload post images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'post-images');
