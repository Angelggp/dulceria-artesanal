-- Tabla de configuración clave-valor para el panel admin
create table if not exists public.settings (
  key   text primary key,
  value text not null default ''
);

alter table public.settings enable row level security;

drop policy if exists "Public can read settings" on public.settings;
create policy "Public can read settings"
  on public.settings for select
  to anon, authenticated
  using (true);

-- Valor inicial: solo transferencia bancaria activo
insert into public.settings (key, value)
values ('efectivo_only', 'true')
on conflict (key) do nothing;
