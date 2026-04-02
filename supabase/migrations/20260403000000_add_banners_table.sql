-- Migration: create banners table for the promotional ticker
create table if not exists public.banners (
  id         uuid primary key default gen_random_uuid(),
  text       text not null,
  active     boolean not null default true,
  color      text not null default 'amber',
  created_at timestamptz not null default now()
);

-- RLS: only service role can write; anon can read active banners
alter table public.banners enable row level security;

create policy "Public can read active banners"
  on public.banners for select
  using (active = true);

create policy "Service role full access"
  on public.banners for all
  using (auth.role() = 'service_role');
