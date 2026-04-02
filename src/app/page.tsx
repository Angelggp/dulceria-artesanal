"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, MapPin, MessageCircle, ChevronRight, CalendarCheck, Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Category } from "@/lib/types";

// ─── Datos del negocio — edita aquí ──────────────────────────────────────────
const BUSINESS = {
  name: "Dulcería Artesanal",
  tagline: "Hecho con amor, endulzado con tradición",
  address: "Castillo de Jagua, Cienfuegos, Cuba",
  mapsUrl: "https://maps.google.com/?q=Castillo+de+Jagua+Cienfuegos+Cuba",
  groupUrl: "https://chat.whatsapp.com/HL48Am49EnP3EyxMGvBhmE",
  instagramUrl: "",               // opcional
  schedule: [
    { day: "Lunes",     open: "9:00",  close: "20:00", active: true },
    { day: "Martes",    open: "9:00",  close: "20:00", active: true },
    { day: "Miércoles", open: "9:00",  close: "20:00", active: true },
    { day: "Jueves",    open: "9:00",  close: "20:00", active: true },
    { day: "Viernes",   open: "9:00",  close: "21:00", active: true },
    { day: "Sábado",    open: "10:00", close: "21:00", active: true },
    { day: "Domingo",   open: "",      close: "",      active: false },
  ],
  rules: [
    "Realiza tu pedido con mínimo 24 h de anticipación",
    "Pedido mínimo de $100 MXN",
    "Envío a domicilio disponible (costo adicional)",
    "Pago en efectivo o transferencia bancaria",
    "Se solicita 50% de anticipo en pedidos mayores a $300",
    "Sin devoluciones en productos personalizados",
  ],
};

// Índice JS: 0=Dom, 1=Lun … 6=Sáb
const SCHEDULE_INDEX = [6, 0, 1, 2, 3, 4, 5];

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function getBusinessStatus(): { open: boolean; message: string } {
  const now = new Date();
  const dayJS = now.getDay(); // 0=Dom … 6=Sáb
  const sched = BUSINESS.schedule[SCHEDULE_INDEX[dayJS]];
  if (!sched.active) return { open: false, message: "Hoy estamos cerrados" };
  const [oh, om] = sched.open.split(":").map(Number);
  const [ch, cm] = sched.close.split(":").map(Number);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const open = oh * 60 + om;
  const close = ch * 60 + cm;
  if (minutes >= open && minutes < close) {
    return { open: true, message: `Abierto hasta las ${formatTime(sched.close)}` };
  }
  if (minutes < open) {
    return { open: false, message: `Abrimos hoy a las ${formatTime(sched.open)}` };
  }
  return { open: false, message: "Cerramos por hoy — volvemos mañana" };
}

// ─── Animaciones ─────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
};

// ─── Componente principal ────────────────────────────────────────────────────
export default function HomePage() {
  const [status, setStatus] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "Cargando...",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const todayIndex = SCHEDULE_INDEX[new Date().getDay()];

  useEffect(() => {
    setStatus(getBusinessStatus());
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories((d as { categories: Category[] }).categories ?? []));
  }, []);

  return (
    <div className="space-y-0">
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden">
        {/* Fondo animado */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          style={{
            background: "linear-gradient(135deg, #fffbeb, #fde68a, #fcd34d, #fed7aa, #fef3c7, #fde68a, #fffbeb)",
            backgroundSize: "400% 400%",
          }}
        />
        {/* Círculos decorativos de profundidad */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200/30 blur-2xl" />

        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
          {/* Badge abierto/cerrado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium shadow-sm ${
              status.open
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              {status.open && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  status.open ? "bg-green-500" : "bg-red-400"
                }`}
              />
            </span>
            {status.message}
          </motion.div>

          {/* Emoji animado */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
            className="text-7xl"
          >
            🍬
          </motion.div>

          {/* Nombre */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.25 }}
            className="text-4xl font-bold text-amber-900 sm:text-5xl"
          >
            {BUSINESS.name}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.35 }}
            className="max-w-md text-lg text-amber-800/80"
          >
            {BUSINESS.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/catalogo"
              className="group flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 font-semibold text-amber-50 shadow-md transition hover:bg-amber-900 hover:shadow-lg"
            >
              <Sparkles size={16} />
              Ver nuestros dulces
              <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={BUSINESS.groupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-amber-300 bg-white/70 px-6 py-3 font-medium text-amber-900 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <MessageCircle size={16} />
              Únete al grupo
            </a>
          </motion.div>
        </div>
      </section>

      {/* ───────────── CATEGORÍAS (preview) ───────────── */}
      {categories.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mb-8 text-center text-2xl font-bold text-zinc-800"
            >
              ¿Qué estás buscando?
            </motion.h2>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-3 sm:grid-cols-5"
            >
              {categories.map((cat) => (
                <motion.div key={cat.id} variants={fadeUp}>
                  <Link
                    href={`/catalogo?cat=${cat.id}`}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 hover:shadow-md"
                  >
                    <span className="text-3xl transition-transform group-hover:scale-110">
                      {cat.emoji || "🍭"}
                    </span>
                    <span className="text-center text-xs font-medium text-amber-900">
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ───────────── INFO CARDS ───────────── */}
      <section className="bg-amber-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-8 text-center text-xl font-semibold text-zinc-800"
          >
            Todo lo que necesitas saber
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Horario */}
            <motion.div
              variants={fadeUp}
              className="space-y-3 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 text-amber-900">
                <Clock size={18} />
                <span className="font-semibold">Horario</span>
              </div>
              <ul className="space-y-1 text-sm">
                {BUSINESS.schedule.map((s, i) => (
                  <li
                    key={s.day}
                    className={`flex justify-between rounded px-2 py-0.5 ${
                      i === todayIndex ? "bg-amber-100 font-semibold text-amber-900" : "text-zinc-600"
                    }`}
                  >
                    <span>{s.day}</span>
                    <span>{s.active ? `${formatTime(s.open)} – ${formatTime(s.close)}` : "Cerrado"}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Dirección */}
            <motion.div
              variants={fadeUp}
              className="space-y-3 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 text-amber-900">
                <MapPin size={18} />
                <span className="font-semibold">Dónde encontrarnos</span>
              </div>
              <p className="text-sm text-zinc-700">{BUSINESS.address}</p>
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-900 transition hover:bg-amber-200"
              >
                <MapPin size={12} />
                Ver en Google Maps
              </a>
              <div className="mt-3 space-y-2 border-t border-amber-100 pt-3">
                <p className="text-xs font-medium text-zinc-500">Contacto directo</p>
                <a
                  href={BUSINESS.groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-green-700 hover:underline"
                >
                  <MessageCircle size={15} />
                  Grupo de WhatsApp
                </a>
              </div>
            </motion.div>

            {/* Reglas de encargo */}
            <motion.div
              variants={fadeUp}
              className="space-y-3 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-2 text-amber-900">
                <CalendarCheck size={18} />
                <span className="font-semibold">Reglas de encargo</span>
              </div>
              <ul className="space-y-2.5">
                {BUSINESS.rules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2.5 text-sm text-zinc-700">
                    <Check size={14} className="mt-0.5 shrink-0 text-amber-600" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───────────── CTA FINAL ───────────── */}
      <section className="bg-amber-900 py-20 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-xl space-y-4 px-4"
        >
          <motion.div variants={fadeUp} className="text-4xl">🎁</motion.div>
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-amber-50">
            ¿Listo para endulzar tu día?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-amber-200">
            Explora nuestro catálogo y arma tu pedido en minutos.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/catalogo"
              className="group inline-flex items-center gap-2 rounded-xl bg-amber-400 px-7 py-3 font-semibold text-amber-900 shadow-md transition hover:bg-amber-300"
            >
              <Sparkles size={16} />
              Ver catálogo completo
              <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

