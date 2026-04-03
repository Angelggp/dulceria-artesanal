-- Añade teléfono del cliente y hora de entrega al pedido
alter table public.orders
  add column if not exists phone      text not null default '',
  add column if not exists order_time text not null default '';
