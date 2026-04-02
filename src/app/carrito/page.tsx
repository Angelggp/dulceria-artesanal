"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, Plus, Minus, ChevronRight, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/format";

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1, y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
  exit: { opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.2 } },
};

export default function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  if (items.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100"
        >
          <ShoppingBag size={44} className="text-amber-400" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Tu carrito está vacío</h1>
          <p className="mt-1 text-zinc-500">Agrega algunos dulces para continuar 🍬</p>
        </div>
        <Link
          href="/catalogo"
          className="flex items-center gap-2 rounded-xl bg-amber-700 px-6 py-3 font-semibold text-amber-50 shadow-md transition hover:bg-amber-800"
        >
          <ArrowLeft size={16} />
          Ir al catálogo
        </Link>
      </motion.section>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-2xl space-y-5"
    >
      {/* Encabezado */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <ShoppingBag size={20} className="text-amber-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Mi carrito</h1>
          <p className="text-sm text-zinc-500">
            {itemCount} {itemCount === 1 ? "producto" : "productos"}
          </p>
        </div>
      </motion.div>

      {/* Lista de productos */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {items.map(({ product, quantity }) => (
            <motion.article
              key={product.id}
              variants={itemVariants}
              exit="exit"
              layout
              className="flex items-center gap-4 overflow-hidden rounded-2xl border border-amber-100 bg-white p-3 shadow-sm"
            >
              {/* Imagen */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900">{product.name}</p>
                <p className="text-sm text-amber-700 font-medium">
                  {formatCurrency(product.price)} c/u
                </p>
                <p className="text-xs text-zinc-400">
                  Subtotal: {formatCurrency(product.price * quantity)}
                </p>
              </div>

              {/* Controles cantidad */}
              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 text-amber-800 transition hover:bg-amber-50 active:bg-amber-100"
                >
                  {quantity === 1 ? <Trash2 size={13} className="text-red-400" /> : <Minus size={13} />}
                </motion.button>
                <motion.span
                  key={quantity}
                  initial={{ scale: 1.4, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-6 text-center text-sm font-bold text-zinc-800"
                >
                  {quantity}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 text-amber-800 transition hover:bg-amber-50 active:bg-amber-100 disabled:opacity-40"
                >
                  <Plus size={13} />
                </motion.button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {/* Resumen */}
      <motion.div
        variants={itemVariants}
        layout
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
      >
        <div className="space-y-2 text-sm text-zinc-600">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between">
              <span className="truncate pr-4">{product.name} ×{quantity}</span>
              <span className="shrink-0 font-medium text-zinc-800">
                {formatCurrency(product.price * quantity)}
              </span>
            </div>
          ))}
          <div className="mt-3 flex items-center justify-between border-t border-amber-200 pt-3">
            <span className="text-base font-bold text-zinc-900">Total</span>
            <motion.span
              key={totalPrice}
              initial={{ scale: 1.15, color: "#b45309" }}
              animate={{ scale: 1, color: "#78350f" }}
              className="text-xl font-bold text-amber-900"
            >
              {formatCurrency(totalPrice)}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* CTA checkout */}
      <motion.div variants={itemVariants}>
        <Link
          href="/checkout"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 text-sm font-semibold text-amber-50 shadow-sm transition hover:bg-amber-800 hover:shadow-md"
        >
          Continuar al checkout
          <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/catalogo"
          className="mt-3 flex items-center justify-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition"
        >
          <ArrowLeft size={14} />
          Seguir comprando
        </Link>
      </motion.div>
    </motion.section>
  );
}

