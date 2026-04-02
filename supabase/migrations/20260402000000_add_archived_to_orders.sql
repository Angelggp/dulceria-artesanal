alter table public.orders
  add column if not exists archived boolean not null default false;
