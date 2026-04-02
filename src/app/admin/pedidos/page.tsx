"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  Archive,
  ArchiveRestore,
  Bell,
  BellOff,
  CreditCard,
  RefreshCw,
  Store,
  Truck,
  X,
} from "lucide-react";

const STATUSES = ["pendiente", "en preparación", "listo", "entregado", "cancelado"] as const;
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
  archived: boolean;
  order_items: OrderItem[];
};

type ReminderConfig = {
  enabled: boolean;
  hour: number;
  minute: number;
  daysBefore: number;
};

const DEFAULT_REMINDER: ReminderConfig = { enabled: false, hour: 9, minute: 0, daysBefore: 1 };

const STATUS_CONFIG: Record<OrderStatus, { label: string; pill: string; dot: string; step: number }> = {
  pendiente:        { label: "Pendiente",       pill: "bg-amber-100 text-amber-800 border-amber-200",   dot: "bg-amber-400",  step: 0 },
  "en preparación": { label: "En preparación",  pill: "bg-blue-100 text-blue-800 border-blue-200",      dot: "bg-blue-500",   step: 1 },
  listo:            { label: "Listo",            pill: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500", step: 2 },
  entregado:        { label: "Entregado",        pill: "bg-violet-100 text-violet-800 border-violet-200", dot: "bg-violet-500", step: 3 },
  cancelado:        { label: "Cancelado",        pill: "bg-red-100 text-red-700 border-red-200",         dot: "bg-red-400",    step: -1 },
};

const STEPPER_STATUSES = ["pendiente", "en preparación", "listo", "entregado"] as const;

function StatusStepper({ current }: { current: OrderStatus }) {
  if (current === "cancelado") {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        ✕ Cancelado
      </span>
    );
  }
  const currentStep = STATUS_CONFIG[current]?.step ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      {STEPPER_STATUSES.map((s, i) => {
        const done = i <= currentStep;
        return (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full transition-colors ${done ? STATUS_CONFIG[s].dot : "bg-zinc-200"}`} />
            {i < STEPPER_STATUSES.length - 1 && (
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

function ReminderModal({
  config,
  onSave,
  onClose,
}: {
  config: ReminderConfig;
  onSave: (c: ReminderConfig) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState(config);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-800">Recordatorios de pedidos</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-zinc-100">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-zinc-700">Activar recordatorios</span>
            <input
              type="checkbox"
              checked={local.enabled}
              onChange={(e) => setLocal((p) => ({ ...p, enabled: e.target.checked }))}
              className="h-4 w-4 accent-amber-600"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">Hora del recordatorio</span>
            <input
              type="time"
              value={`${String(local.hour).padStart(2, "0")}:${String(local.minute).padStart(2, "0")}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                setLocal((p) => ({ ...p, hour: h, minute: m }));
              }}
              disabled={!local.enabled}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-400 disabled:opacity-50"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">Avisar con cuántos días de anticipación</span>
            <select
              value={local.daysBefore}
              onChange={(e) => setLocal((p) => ({ ...p, daysBefore: Number(e.target.value) }))}
              disabled={!local.enabled}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-400 disabled:opacity-50"
            >
              {[1, 2, 3, 5, 7].map((d) => (
                <option key={d} value={d}>{d} día{d > 1 ? "s" : ""} antes</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onSave(local); onClose(); }}
            className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"activos" | "archivados">("activos");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "todos">("todos");
  const [filterDate, setFilterDate] = useState("");
  const [showReminder, setShowReminder] = useState(false);
  const [reminder, setReminder] = useState<ReminderConfig>(DEFAULT_REMINDER);
  const lastNotifiedRef = useRef("");

  // Cargar config de recordatorio
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dulceria_reminder");
      if (stored) setReminder(JSON.parse(stored) as ReminderConfig);
    } catch {}
  }, []);

  // Notificaciones periódicas
  useEffect(() => {
    if (!reminder.enabled) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      if (!reminder.enabled) return;
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);
      if (lastNotifiedRef.current === todayKey) return;
      if (now.getHours() !== reminder.hour || now.getMinutes() !== reminder.minute) return;

      lastNotifiedRef.current = todayKey;

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + reminder.daysBefore);
      const cutoffKey = cutoff.toISOString().slice(0, 10);

      orders
        .filter((o) => !o.archived && o.status !== "entregado" && o.order_date <= cutoffKey)
        .forEach((o) => {
          new Notification(`🍬 Pedido próximo: ${o.customer_name}`, {
            body: `📅 ${o.order_date} · ${o.delivery ? "Domicilio" : "En tienda"} · ${formatCurrency(o.total)}`,
          });
        });
    }, 30_000);

    return () => clearInterval(interval);
  }, [reminder, orders]);

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

  function saveReminder(cfg: ReminderConfig) {
    setReminder(cfg);
    localStorage.setItem("dulceria_reminder", JSON.stringify(cfg));
    if (cfg.enabled && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  async function changeStatus(orderId: string, status: OrderStatus) {
    setUpdating(orderId);
    const autoArchive = status === "entregado" || status === "cancelado";
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(autoArchive ? { archived: true } : {}) }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status, archived: autoArchive ? true : o.archived } : o
        )
      );
    }
    setUpdating(null);
  }

  async function toggleArchive(orderId: string, archived: boolean) {
    setUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    if (res.ok) setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, archived } : o)));
    setUpdating(null);
  }

  const activeOrders = orders.filter((o) => !o.archived);
  const archivedOrders = orders.filter((o) => o.archived);
  const source = tab === "activos" ? activeOrders : archivedOrders;

  const filtered = source.filter((o) => {
    if (tab === "activos" && filterStatus !== "todos" && o.status !== filterStatus) return false;
    if (filterDate && o.order_date !== filterDate) return false;
    return true;
  });

  return (
    <section className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-800">Pedidos</h1>
          <p className="text-sm text-zinc-500">
            {activeOrders.length} activos · {archivedOrders.length} archivados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReminder(true)}
            title="Configurar recordatorios"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
              reminder.enabled
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {reminder.enabled ? <Bell size={13} /> : <BellOff size={13} />}
            <span className="hidden sm:inline">Recordatorio</span>
          </button>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        {(["activos", "archivados"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setFilterStatus("todos"); setFilterDate(""); }}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "border-b-2 border-amber-500 text-amber-700"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t === "activos" ? "Activos" : "Archivados"}
            <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
              {t === "activos" ? activeOrders.length : archivedOrders.length}
            </span>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {tab === "activos" && (
          <div className="flex flex-wrap gap-1.5">
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
                    ({activeOrders.filter((o) => o.status === s).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-700 outline-none focus:border-amber-400"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="rounded p-1 text-zinc-400 hover:text-zinc-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
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
            <p className="text-2xl">{tab === "archivados" ? "🗃️" : "📋"}</p>
            <p className="mt-2 text-sm text-zinc-500">
              {tab === "archivados" ? "No hay pedidos archivados." : "No hay pedidos en esta categoría."}
            </p>
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
                    <p className="text-xs text-zinc-400">Folio #{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold ${cfg.pill}`}>
                      {cfg.label}
                    </span>
                    <button
                      title={order.archived ? "Restaurar pedido" : "Archivar pedido"}
                      disabled={updating === order.id}
                      onClick={() => toggleArchive(order.id, !order.archived)}
                      className="rounded-lg border border-zinc-200 p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 disabled:opacity-50"
                    >
                      {order.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                    </button>
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="space-y-3 px-4 py-3">
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
                    <span>📅 {order.order_date.split("-").reverse().join("/")}</span>
                  </div>

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

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <StatusStepper current={order.status} />
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-zinc-800">
                        {formatCurrency(order.total)}
                      </span>
                      {!order.archived && (
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
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {showReminder && (
        <ReminderModal config={reminder} onSave={saveReminder} onClose={() => setShowReminder(false)} />
      )}
    </section>
  );
}
