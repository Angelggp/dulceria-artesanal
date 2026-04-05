"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, Calendar, CreditCard, Truck, ArrowLeft, Lock, ChevronRight, ShoppingBag, Phone, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 26, delay: i * 0.07 },
  }),
};

// Horario del negocio (0 = Domingo, 1 = Lunes ... 6 = Sábado)
const SCHEDULE: Record<number, { open: string; close: string } | null> = {
  0: { open: "08:00", close: "19:00" }, // Domingo
  1: { open: "08:00", close: "19:00" }, // Lunes
  2: { open: "08:00", close: "19:00" }, // Martes
  3: { open: "08:00", close: "19:00" }, // Miércoles
  4: { open: "08:00", close: "19:00" }, // Jueves
  5: { open: "08:00", close: "19:00" }, // Viernes
  6: null,                               // Sábado: cerrado
};
const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function fmtTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${p}`;
}

function validateDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, mo, d] = dateStr.split("-").map(Number);
  const selected = new Date(y, mo - 1, d);
  // Verificar que sea una fecha real (ej. 30/02 es inválido)
  if (
    selected.getFullYear() !== y ||
    selected.getMonth() !== mo - 1 ||
    selected.getDate() !== d
  ) return "Fecha inválida. Verifica día y mes.";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selected <= today)
    return "La fecha debe ser al menos con 24 h de anticipación.";
  const dow = selected.getDay();
  if (!SCHEDULE[dow])
    return `Los ${DAY_NAMES[dow]} estamos cerrados. Por favor elige otro día.`;
  return "";
}

function validateTime(timeStr: string, dateStr: string): string {
  if (!timeStr || !dateStr) return "";
  const [y, mo, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, mo - 1, d).getDay();
  const sched = SCHEDULE[dow];
  if (!sched) return "";
  const [th, tm] = timeStr.split(":").map(Number);
  const [oh, om] = sched.open.split(":").map(Number);
  const [ch, cm] = sched.close.split(":").map(Number);
  if (th * 60 + tm < oh * 60 + om || th * 60 + tm >= ch * 60 + cm)
    return `El horario ese día es de ${fmtTime(sched.open)} a ${fmtTime(sched.close)}.`;
  return "";
}

const FORM_KEY = "dulceria_checkout_draft";

type FormDraft = {
  customerName: string;
  phone: string;
  address: string;
  paymentType: string;
  delivery: boolean;
  orderDate: string;
  orderTime: string;
};

function loadDraft(): Partial<FormDraft> {
  try {
    const raw = sessionStorage.getItem(FORM_KEY);
    return raw ? (JSON.parse(raw) as FormDraft) : {};
  } catch { return {}; }
}

function saveDraft(d: Partial<FormDraft>) {
  try { sessionStorage.setItem(FORM_KEY, JSON.stringify(d)); } catch { /* noop */ }
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderTime, setOrderTime] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [efectivoOnly, setEfectivoOnly] = useState(false);

  // Cargar borrador guardado al montar
  useEffect(() => {
    const draft = loadDraft();
    if (draft.customerName) setCustomerName(draft.customerName);
    if (draft.phone) setPhone(draft.phone);
    if (draft.address) setAddress(draft.address);
    if (draft.paymentType) setPaymentType(draft.paymentType);
    if (draft.delivery !== undefined) setDelivery(draft.delivery);
    if (draft.orderDate) {
      setOrderDate(draft.orderDate);
      setDateError(validateDate(draft.orderDate));
    }
    if (draft.orderTime) setOrderTime(draft.orderTime);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: { settings?: Record<string, string> }) => {
        if (d.settings?.efectivo_only === "true") {
          setEfectivoOnly(true);
          // Forzar efectivo aunque haya un borrador con transferencia
          setPaymentType("efectivo");
        }
      })
      .catch(() => {});
  }, []);

  // Guardar borrador cada vez que cambia algo
  useEffect(() => {
    saveDraft({ customerName, phone, address, paymentType, delivery, orderDate, orderTime });
  }, [customerName, phone, address, paymentType, delivery, orderDate, orderTime]);

  const schedForDate = orderDate
    ? (() => {
        const [y, mo, d] = orderDate.split("-").map(Number);
        return SCHEDULE[new Date(y, mo - 1, d).getDay()];
      })()
    : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const dErr = validateDate(orderDate);
    const tErr = validateTime(orderTime, orderDate);
    setDateError(dErr);
    setTimeError(tErr);
    if (!orderDate) { setDateError("Por favor selecciona una fecha."); return; }
    if (!orderTime) { setTimeError("Por favor selecciona una hora."); return; }
    if (dErr || tErr) return;

    setIsLoading(true);

    const payload = {
      customerName,
      phone,
      address: delivery ? address : "Recoge en tienda",
      // Si solo se acepta efectivo, ignorar lo que diga el estado
      paymentType: efectivoOnly ? "efectivo" : paymentType,
      delivery,
      orderDate,
      orderTime,
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      total: totalPrice,
    };

    try {
      const response = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("No se pudo generar mensaje de WhatsApp.");

      const data = await response.json();
      // Limpiar borrador al finalizar el pedido
      try { sessionStorage.removeItem(FORM_KEY); } catch { /* noop */ }
      router.push(`/confirmacion?wa=${encodeURIComponent(data.waUrl)}&t=${Date.now()}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
      >
        <ShoppingBag size={48} className="text-amber-300" />
        <p className="text-zinc-600">No hay productos en el carrito.</p>
      </motion.div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100 placeholder:text-zinc-400";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl"
    >
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Confirmar pedido</h1>
          <p className="text-sm text-zinc-500">{items.length} producto{items.length !== 1 ? "s" : ""} · {formatCurrency(totalPrice)}</p>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-4 lg:col-span-3">

          {/* Nombre */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <User size={12} /> Nombre completo
            </label>
            <input
              name="customerName"
              required
              placeholder="María García"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={inputCls}
            />
          </motion.div>

          {/* Teléfono */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <Phone size={12} /> Teléfono de contacto
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="Ej. 55123456"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className={inputCls}
            />
          </motion.div>

          {/* Fecha */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <Calendar size={12} /> Fecha del pedido
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => {
                const val = e.target.value;
                setOrderDate(val);
                const dErr = validateDate(val);
                setDateError(dErr);
                if (orderTime) setTimeError(validateTime(orderTime, val));
              }}
              required
              className={inputCls}
            />
            {dateError && (
              <p className="text-xs font-medium text-red-600">⚠️ {dateError}</p>
            )}
          </motion.div>

          {/* Hora de entrega */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <Clock size={12} /> Hora de entrega
              {schedForDate && (
                <span className="ml-1 font-normal normal-case text-zinc-400">
                  ({fmtTime(schedForDate.open)} – {fmtTime(schedForDate.close)})
                </span>
              )}
            </label>
            <input
              type="time"
              min={schedForDate?.open}
              max={schedForDate?.close}
              value={orderTime}
              onChange={(e) => {
                const val = e.target.value;
                setOrderTime(val);
                setTimeError(validateTime(val, orderDate));
              }}
              required
              disabled={!orderDate || !!dateError}
              className={`${inputCls}${!orderDate || !!dateError ? " cursor-not-allowed opacity-50" : ""}`}
            />
            {!orderDate && (
              <p className="text-xs text-zinc-400">Selecciona primero una fecha.</p>
            )}
            {timeError && (
              <p className="text-xs font-medium text-red-600">⚠️ {timeError}</p>
            )}
          </motion.div>

          {/* Pago */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show" className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <CreditCard size={12} /> Método de pago
            </label>
            <select name="paymentType" required value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className={inputCls}>
              {!efectivoOnly && !paymentType && <option value="">Selecciona...</option>}
              <option value="efectivo">💵 Efectivo</option>
              <option value="transferencia" disabled={efectivoOnly}>🏦 Transferencia bancaria</option>
            </select>
            {efectivoOnly && (
              <p className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                ℹ️ Por el momento solo aceptamos efectivo.
              </p>
            )}
          </motion.div>

          {/* Entrega a domicilio toggle */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show">
            <button
              type="button"
              onClick={() => { setDelivery((v) => !v); }}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                delivery
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300"
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${delivery ? "bg-amber-200" : "bg-zinc-100"}`}>
                <Truck size={15} className={delivery ? "text-amber-700" : "text-zinc-400"} />
              </div>
              <span className="flex-1 text-left">Envío a domicilio</span>
              <div className={`h-5 w-9 rounded-full transition-colors ${delivery ? "bg-amber-500" : "bg-zinc-200"}`}>
                <motion.div
                  layout
                  className="m-0.5 h-4 w-4 rounded-full bg-white shadow"
                  animate={{ x: delivery ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
              {/* hidden input para el form */}
              <input type="checkbox" name="delivery" checked={delivery} onChange={() => {}} className="hidden" />
            </button>
          </motion.div>

          {/* Dirección (aparece solo si delivery) */}
          <AnimatePresence>
            {delivery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <MapPin size={12} /> Dirección de entrega
                </label>
                <input
                  name="address"
                  required={delivery}
                  placeholder="Calle, número, colonia..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputCls}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            custom={7}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 text-sm font-semibold text-amber-50 shadow-sm transition hover:bg-amber-800 hover:shadow-md disabled:opacity-60"
          >
            {isLoading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              <>
                <Lock size={15} />
                Confirmar pedido
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        </form>

        {/* Resumen lateral */}
        <motion.aside
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="lg:col-span-2"
        >
          <div className="sticky top-20 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-zinc-800">Resumen</h2>
            <ul className="space-y-3">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800">{product.name}</p>
                    <p className="text-xs text-zinc-400">×{quantity}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-zinc-700">
                    {formatCurrency(product.price * quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
              <span className="font-semibold text-zinc-700">Total</span>
              <span className="text-xl font-bold text-amber-800">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}
