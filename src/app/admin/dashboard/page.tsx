"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  CreditCard,
  Package,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";

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
  status: string;
  total: number;
  created_at: string;
  archived: boolean;
  order_items: OrderItem[];
};

type ReminderConfig = {
  enabled: boolean;
  daysBefore: number;
};

function formatDate(iso: string) {
  return iso.split("-").reverse().join("/");
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

const STATUS_COLORS: Record<string, string> = {
  pendiente:        "bg-amber-100 text-amber-800 border-amber-200",
  "en preparación": "bg-blue-100 text-blue-800 border-blue-200",
  listo:            "bg-emerald-100 text-emerald-800 border-emerald-200",
  entregado:        "bg-violet-100 text-violet-800 border-violet-200",
  cancelado:        "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente:        "Pendiente",
  "en preparación": "En preparación",
  listo:            "Listo",
  entregado:        "Entregado",
  cancelado:        "Cancelado",
};

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-xl font-bold text-zinc-800">{value}</p>
        {sub && <p className="text-xs text-zinc-400">{sub}</p>}
      </div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="h-11 w-11 shrink-0 rounded-xl bg-zinc-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-zinc-200" />
        <div className="h-6 w-16 rounded bg-zinc-300" />
        <div className="h-2.5 w-20 rounded bg-zinc-100" />
      </div>
    </div>
  );
}

function SkeletonOrderRow() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm animate-pulse">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-36 rounded bg-zinc-200" />
        <div className="h-2.5 w-48 rounded bg-zinc-100" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="h-5 w-20 rounded-full bg-zinc-200" />
        <div className="h-4 w-14 rounded bg-zinc-100" />
      </div>
    </div>
  );
}

function SkeletonBar() {
  return (
    <div className="space-y-1.5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-zinc-200" />
        <div className="h-3 w-12 rounded bg-zinc-200" />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
        <div className="h-2 rounded-full bg-zinc-200" style={{ width: "60%" }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminderDays, setReminderDays] = useState(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dulceria_reminder");
      if (stored) {
        const cfg = JSON.parse(stored) as ReminderConfig;
        setReminderDays(cfg.daysBefore ?? 1);
      }
    } catch {}

    fetch("/api/orders")
      .then((r) => r.json())
      .then((d: { orders?: Order[] }) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  const active = orders.filter((o) => !o.archived);

  // Métricas
  const totalActive   = active.length;
  const pendientes    = active.filter((o) => o.status === "pendiente").length;
  const enPrep        = active.filter((o) => o.status === "en preparación").length;
  const listos        = active.filter((o) => o.status === "listo").length;
  const todayStr      = new Date().toISOString().slice(0, 10);
  const todayOrders   = active.filter((o) => o.order_date === todayStr);
  const todayRevenue  = todayOrders.reduce((s, o) => s + o.total, 0);

  // Pedidos próximos (dentro del rango configurado, no archivados, no cancelados)
  const upcoming = active
    .filter((o) => o.status !== "cancelado")
    .filter((o) => {
      const d = daysUntil(o.order_date);
      return d >= 0 && d <= reminderDays;
    })
    .sort((a, b) => a.order_date.localeCompare(b.order_date));

  // Últimos 3 pedidos registrados
  const latest = [...orders]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-800">Dashboard</h1>
        <p className="text-sm text-zinc-500">Resumen de tu dulcería</p>
      </div>

      {/* ── Métricas ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Pedidos activos"
              value={totalActive}
              color="bg-amber-100"
              icon={<ShoppingBag size={20} className="text-amber-700" />}
            />
            <StatCard
              label="Pendientes"
              value={pendientes}
              sub={enPrep > 0 ? `+ ${enPrep} en prep.` : undefined}
              color="bg-blue-100"
              icon={<Clock size={20} className="text-blue-700" />}
            />
            <StatCard
              label="Listos para entregar"
              value={listos}
              color="bg-emerald-100"
              icon={<Package size={20} className="text-emerald-700" />}
            />
            <StatCard
              label="Ingresos hoy"
              value={formatCurrency(todayRevenue)}
              sub={todayOrders.length > 0 ? `${todayOrders.length} pedido${todayOrders.length > 1 ? "s" : ""}` : "Sin pedidos hoy"}
              color="bg-violet-100"
              icon={<CreditCard size={20} className="text-violet-700" />}
            />
          </>
        )}
      </div>

      {/* ── Banner recordatorio ── */}
      {!loading && upcoming.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">
              {upcoming.length} pedido{upcoming.length > 1 ? "s" : ""} próximo{upcoming.length > 1 ? "s" : ""} en los próximos {reminderDays} día{reminderDays > 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-2">
            {upcoming.map((o) => {
              const d = daysUntil(o.order_date);
              return (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[o.status] ?? ""}`}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                    <span className="truncate text-sm font-medium text-zinc-800">{o.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 shrink-0">
                    <span className="flex items-center gap-1">
                      {o.delivery ? <Truck size={11} /> : <Store size={11} />}
                      {o.delivery ? "Domicilio" : "En tienda"}
                    </span>
                    <span className="font-semibold text-amber-700">
                      {d === 0 ? "¡Hoy!" : d === 1 ? "Mañana" : `En ${d} días`}
                    </span>
                    <span>📅 {formatDate(o.order_date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-amber-600">
              Rango configurado: {reminderDays} día{reminderDays > 1 ? "s" : ""}. Ajústalo en{" "}
              <Link href="/admin/pedidos" className="underline">Pedidos → Recordatorio</Link>.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── Últimos 3 pedidos ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-800">Últimos pedidos</h2>
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-1 text-xs text-amber-700 hover:underline"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonOrderRow key={i} />)
          ) : latest.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 py-8 text-center">
              <p className="text-sm text-zinc-400">No hay pedidos aún.</p>
            </div>
          ) : (
            latest.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{o.customer_name}</p>
                  <p className="text-xs text-zinc-400">
                    #{o.id.slice(0, 8).toUpperCase()} · 📅 {formatDate(o.order_date)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[o.status] ?? ""}`}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                  <span className="text-sm font-bold text-zinc-700">{formatCurrency(o.total)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Distribución por estado ── */}
        <div className="space-y-3">
          <h2 className="font-semibold text-zinc-800">Estado de pedidos activos</h2>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonBar key={i} />)
          ) : totalActive === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 py-8 text-center">
              <p className="text-sm text-zinc-400">Sin pedidos activos.</p>
            </div>
          ) : (
            (["pendiente", "en preparación", "listo"] as const).map((status) => {
              const count = active.filter((o) => o.status === status).length;
              const pct = totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-600">
                    <span>{STATUS_LABELS[status]}</span>
                    <span className="font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        status === "pendiente"        ? "bg-amber-400" :
                        status === "en preparación"   ? "bg-blue-500" :
                                                        "bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
