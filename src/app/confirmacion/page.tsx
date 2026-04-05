"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, MessageCircle, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

const COUNTDOWN_SECONDS = 3;

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const wa = searchParams.get("wa");
  const t = searchParams.get("t");
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [redirected, setRedirected] = useState(false);

  // Vaciar el carrito automáticamente al llegar a la confirmación
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Resetear el contador en cada pedido nuevo (wa Y timestamp únicos por pedido)
  useEffect(() => {
    setCountdown(COUNTDOWN_SECONDS);
    setRedirected(false);
  }, [wa, t]);

  // Cuenta regresiva y redirect automático
  useEffect(() => {
    if (!wa || redirected) return;

    if (countdown <= 0) {
      setRedirected(true);
      window.location.href = wa;
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, wa, redirected]);

  function handleGoHome() {
    router.push("/");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 260, damping: 24 }}
        className="w-full max-w-sm text-center"
      >
        {/* Icono animado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 20, delay: 0.1 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50"
        >
          <CheckCircle size={40} className="text-amber-600" strokeWidth={1.5} />
        </motion.div>

        {/* Texto */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-bold text-zinc-900">¡Pedido listo!</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Tu pedido está preparado. Envíalo por WhatsApp para que el negocio lo reciba y confirme.
          </p>
        </motion.div>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 space-y-3"
        >
          {/* Botón WhatsApp con spinner de cuenta regresiva */}
          <a
            href={wa || "#"}
            className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md"
          >
            {countdown > 0 ? (
              <>
                {/* Spinner SVG */}
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Abriendo WhatsApp en {countdown}…
              </>
            ) : (
              <>
                <MessageCircle size={16} />
                Enviar por WhatsApp
              </>
            )}
          </a>
          <button
            onClick={handleGoHome}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            <ArrowLeft size={15} />
            Volver al inicio
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Cargando...</p>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
