"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, Calendar, CreditCard, Truck, ArrowLeft, Lock, ChevronRight, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 26, delay: i * 0.07 },
  }),
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      customerName: String(formData.get("customerName") || ""),
      address: String(formData.get("address") || ""),
      paymentType: String(formData.get("paymentType") || ""),
      delivery: formData.get("delivery") === "on",
      orderDate: String(formData.get("orderDate") || ""),
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
      router.push(`/confirmacion?wa=${encodeURIComponent(data.waUrl)}`);
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
              className={inputCls}
            />
          </motion.div>

          {/* Fecha */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <Calendar size={12} /> Fecha del pedido
            </label>
            <input
              type="date"
              name="orderDate"
              required
              className={inputCls}
            />
          </motion.div>

          {/* Pago */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <CreditCard size={12} /> Método de pago
            </label>
            <select name="paymentType" required className={inputCls}>
              <option value="">Selecciona...</option>
              <option value="efectivo">💵 Efectivo</option>
              <option value="transferencia">🏦 Transferencia bancaria</option>
            </select>
          </motion.div>

          {/* Entrega a domicilio toggle */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
            <button
              type="button"
              onClick={() => setDelivery((v) => !v)}
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
                  className={inputCls}
                />
              </motion.div>
            )}
            {!delivery && (
              <input type="hidden" name="address" value="Recoge en tienda" />
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
            custom={5}
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
