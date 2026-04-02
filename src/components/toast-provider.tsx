"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart-store";

export default function ToastProvider() {
  const lastAdded = useCartStore((s) => s.lastAdded);
  const clearLastAdded = useCartStore((s) => s.clearLastAdded);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastAdded) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(clearLastAdded, 2200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastAdded, clearLastAdded]);

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-50 md:bottom-8">
      <AnimatePresence mode="wait">
        {lastAdded && (
          <motion.div
            key={lastAdded}
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-3 text-sm text-amber-50 shadow-xl"
          >
            <ShoppingCart size={15} className="shrink-0" />
            <span>
              <span className="font-semibold">{lastAdded}</span> agregado al carrito
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
