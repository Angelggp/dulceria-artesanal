alter table public.products
  add column if not exists visible boolean not null default true;
