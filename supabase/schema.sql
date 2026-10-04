-- Run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  slug text unique,
  display_name text not null default 'Maya Hart',
  tagline text,
  bio text,
  location text default 'Las Vegas',
  height text default '5''8"',
  created_at timestamptz default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('image','video')),
  storage_path text not null,
  public_url text not null,
  title text,
  alt_text text,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  project_type text,
  details text,
  status text not null default 'new',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.media enable row level security;
alter table public.bookings enable row level security;

create policy "public profiles readable" on public.profiles for select using (true);
create policy "public media readable" on public.media for select using (is_public = true);
create policy "owners manage own profiles" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "owners manage own media" on public.media for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Booking inserts are public; authenticated owners/admins can read them.
create policy "anyone can create booking" on public.bookings for insert with check (true);
create policy "authenticated can read bookings" on public.bookings for select using (auth.role() = 'authenticated');

insert into storage.buckets (id,name,public) values ('photos','photos',true) on conflict (id) do nothing;
insert into storage.buckets (id,name,public) values ('videos','videos',true) on conflict (id) do nothing;

create policy "public photos readable" on storage.objects for select using (bucket_id='photos');
create policy "public videos readable" on storage.objects for select using (bucket_id='videos');
create policy "authenticated upload photos" on storage.objects for insert to authenticated with check (bucket_id='photos' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "authenticated upload videos" on storage.objects for insert to authenticated with check (bucket_id='videos' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "owners delete photos" on storage.objects for delete to authenticated using (bucket_id='photos' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "owners delete videos" on storage.objects for delete to authenticated using (bucket_id='videos' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- After creating the model user in Authentication > Users, run:
-- insert into public.profiles(id,slug,display_name) values ('USER-UUID','maya-hart','Maya Hart');