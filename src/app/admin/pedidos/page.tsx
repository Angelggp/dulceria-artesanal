"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { CreditCard, Truck, Store, RefreshCw } from "lucide-react";

const STATUSES = ["pendiente", "en preparación", "listo", "entregado"] as const;
type OrderStatus = (typeof STATUSES)[number];

type OrderItem = {
  id: number;
  product_id: string;
  quantity: number;
  price: number;
  products: { id: string; name: string } | null;
};

type Order = {
  id: string;
  customer_name: string;
  address: string;
  payment_type: string;
  delivery: boolean;
  order_date: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; pill: string; dot: string; step: number }> = {
  pendiente:        { label: "Pendiente",        pill: "bg-yellow-100 text-yellow-800 border-yellow-200", dot: "bg-yellow-400", step: 0 },
  "en preparación": { label: "En preparación",   pill: "bg-blue-100 text-blue-800 border-blue-200",       dot: "bg-blue-400",   step: 1 },
  listo:            { label: "Listo",             pill: "bg-green-100 text-green-800 border-green-200",    dot: "bg-green-500",  step: 2 },
  entregado:        { label: "Entregado",         pill: "bg-zinc-100 text-zinc-500 border-zinc-200",       dot: "bg-zinc-400",   step: 3 },
};

function StatusStepper({ current }: { current: OrderStatus }) {
  const currentStep = STATUS_CONFIG[current]?.step ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      {STATUSES.map((s, i) => {
        const done = i <= currentStep;
        return (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className={`h-3 w-3 rounded-full transition-colors ${
                done ? STATUS_CONFIG[s].dot : "bg-zinc-200"
              }`}
            />
            {i < STATUSES.length - 1 && (
              <div className={`h-px w-5 transition-colors ${i < currentStep ? "bg-zinc-400" : "bg-zinc-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 rounded bg-zinc-200" />
          <div className="h-3 w-56 rounded bg-zinc-100" />
          <div className="h-3 w-32 rounded bg-zinc-100" />
        </div>
        <div className="h-6 w-24 rounded-full bg-zinc-200" />
      </div>
    </div>
  );
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "todos">("todos");

  function load() {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data: { orders?: Order[]; error?: string }) => {
        if (data.error) setError(data.error);
        else setOrders(data.orders ?? []);
      })
      .catch(() => setError("No se pudieron cargar los pedidos."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function changeStatus(orderId: string, status: OrderStatus) {
    setUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
    setUpdating(null);
  }

  const filtered = filterStatus === "todos" ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <section className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-800">Pedidos</h1>
          <p className="text-sm text-zinc-500">{orders.length} en total</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          <RefreshCw size={13} />
          Actualizar
        </button>
      </div>

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2">
        {(["todos", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filterStatus === s
                ? "border-amber-400 bg-amber-100 text-amber-900"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {s === "todos" ? "Todos" : STATUS_CONFIG[s].label}
            {s !== "todos" && (
              <span className="ml-1 text-zinc-400">
                ({orders.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white py-14 text-center">
            <p className="text-2xl">📋</p>
            <p className="mt-2 text-sm text-zinc-500">No hay pedidos en esta categoría.</p>
          </div>
        ) : (
          filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pendiente;
            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                {/* Header de la card */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900">{order.customer_name}</p>
                    <p className="text-xs text-zinc-400">
                      Folio #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold ${cfg.pill}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Cuerpo */}
                <div className="space-y-3 px-4 py-3">
                  {/* Logística + fecha en una sola línea */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      {order.delivery ? <Truck size={12} /> : <Store size={12} />}
                      {order.delivery ? "Domicilio" : "En tienda"}
                    </span>
                    <span className="text-zinc-300">·</span>
                    <span className="flex items-center gap-1">
                      <CreditCard size={12} />
                      {order.payment_type}
                    </span>
                    <span className="text-zinc-300">·</span>
                    <span>📅 {order.order_date}</span>
                  </div>

                  {/* Items (compactos) */}
                  <ul className="divide-y divide-zinc-50 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-1 text-sm">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between py-1.5">
                        <span className="text-zinc-700">{item.products?.name ?? item.product_id}</span>
                        <span className="shrink-0 text-xs text-zinc-400">
                          ×{item.quantity} · {formatCurrency(item.price)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Footer: stepper + total + selector */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <StatusStepper current={order.status} />
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-zinc-800">
                        {formatCurrency(order.total)}
                      </span>
                      <select
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 shadow-sm outline-none focus:border-amber-400 disabled:opacity-60"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
