"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, LayoutGrid } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export default function Header() {
  const totalItems = useCartStore((state) => state.totalItems());
  return (
    <header className="sticky top-0 z-10 border-b border-amber-200 bg-amber-50/95 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-amber-900">
          🍬 Dulcería Artesanal
        </Link>
        {/* Desktop links — ocultos en móvil (usa bottom navbar) */}
        <div className="hidden items-center gap-1 text-sm md:flex">
          <Link
            href="/catalogo"
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-amber-900 hover:bg-amber-100"
          >
            <LayoutGrid size={15} />
            Catálogo
          </Link>
          <Link
            href="/carrito"
            className="relative flex items-center gap-1.5 rounded bg-amber-700 px-3 py-1.5 text-amber-50 hover:bg-amber-800"
          >
            <motion.span
              animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
              transition={{ duration: 0.55, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              style={{ display: "inline-flex" }}
            >
              <ShoppingBag size={15} />
            </motion.span>
            Carrito
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 24 }}
                  className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-amber-800"
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
        {/* Mobile: solo icono de carrito con badge */}
        <Link href="/carrito" className="relative md:hidden">
          <motion.span
            animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
            transition={{ duration: 0.55, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
            style={{ display: "inline-flex" }}
          >
            <ShoppingBag size={22} className="text-amber-900" />
          </motion.span>
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500 }}
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-700 text-[9px] font-bold text-white"
              >
                {totalItems > 9 ? "9+" : totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </nav>
    </header>
  );
}

