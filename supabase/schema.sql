-- ==========================================================================
-- Timi Ogunyemi & Co. — Articles CMS schema
-- Run this once in your Supabase project: SQL Editor → New query → paste
-- this whole file → Run.
-- ==========================================================================

-- ---------- Table ----------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  tag text not null,                 -- practice area, e.g. "Startup & VC Advisory"
  author text not null default 'Timi Ogunyemi',
  publish_date date not null default current_date,
  read_time text not null default '5 min read',
  cover_url text,
  excerpt text not null default '',
  body text not null default '',     -- HTML from the admin editor (Quill output)
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at current on every edit
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------
alter table public.articles enable row level security;

-- Anyone (including logged-out visitors) can read PUBLISHED articles only.
drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
  on public.articles for select
  using (status = 'published');

-- Logged-in users (the lawyer / admin) can read every article, draft or not.
drop policy if exists "Authenticated can read all articles" on public.articles;
create policy "Authenticated can read all articles"
  on public.articles for select
  to authenticated
  using (true);

-- Logged-in users can create, edit, and delete articles.
drop policy if exists "Authenticated can insert articles" on public.articles;
create policy "Authenticated can insert articles"
  on public.articles for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update articles" on public.articles;
create policy "Authenticated can update articles"
  on public.articles for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete articles" on public.articles;
create policy "Authenticated can delete articles"
  on public.articles for delete
  to authenticated
  using (true);

-- ---------- Storage (cover images + in-article images) ----------
-- Creates a public bucket named "article-images". Public = anyone can VIEW
-- the images (needed so visitors' browsers can load them); only logged-in
-- users can upload/delete, enforced by the policies below.
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view article images" on storage.objects;
create policy "Public can view article images"
  on storage.objects for select
  using (bucket_id = 'article-images');

drop policy if exists "Authenticated can upload article images" on storage.objects;
create policy "Authenticated can upload article images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'article-images');

drop policy if exists "Authenticated can delete article images" on storage.objects;
create policy "Authenticated can delete article images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'article-images');

-- ---------- Optional: seed your 5 existing articles ----------
-- Uncomment and run this block if you want the articles already in
-- assets/data/articles.json carried over into the database instead of
-- starting empty. Safe to skip — you can also just re-create them by hand
-- through the new admin dashboard.
--
-- insert into public.articles (title, slug, tag, author, publish_date, read_time, cover_url, excerpt, body, featured, status)
-- values
--   ('Understanding Nigeria''s Startup Act: What Founders Need to Know', 'startup-act', 'Startup & VC Advisory', 'Timi Ogunyemi', '2026-06-12', '6 min read', 'assets/lawyer-at-desk.jpg', 'A practical breakdown of what Startup Act designation actually changes for a growing company — and what it doesn''t.', '<p>...</p>', true, 'published');
