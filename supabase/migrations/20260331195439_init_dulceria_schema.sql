create extension if not exists "pgcrypto";

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  image text not null,
  description text not null,
  stock integer not null default 0 check (stock >= 0)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  address text not null,
  payment_type text not null,
  delivery boolean not null default false,
  order_date date not null,
  status text not null default 'pendiente',
  total numeric(10, 2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0)
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products
  for select
  to anon, authenticated
  using (true);

-- El backend usa SERVICE ROLE para insertar orders/order_items.
-- No creamos policy publica de insercion para proteger datos.

insert into public.products (id, name, category, price, image, description, stock) values
('choc-01', 'Caja de Trufas Artesanales', 'chocolates', 220, 'https://images.unsplash.com/photo-1481391032119-d89fee407e44', 'Surtido de 12 trufas rellenas de ganache y avellana.', 12),
('gom-01', 'Mix de Gomitas Frutales', 'gomitas', 85, 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f', 'Bolsa de 500g con gomitas suaves y sabor intenso.', 20),
('pal-01', 'Paletas Gourmet (6 pzas)', 'paletas', 95, 'https://images.unsplash.com/photo-1575223970966-76ae61ee7838', 'Paletas de caramelo suave con sabores tradicionales.', 10),
('ench-01', 'Enchilados de Tamarindo', 'enchilados', 70, 'https://images.unsplash.com/photo-1633933358116-a27b902fad35', 'Mezcla picosita de tamarindo, mango y chamoy.', 16),
('reg-01', 'Canasta Dulce Regalo', 'regalos', 320, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48', 'Canasta para regalo con seleccion premium de dulces.', 5)
on conflict (id) do nothing;
