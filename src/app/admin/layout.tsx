"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  LayoutGrid,
  Tag,
  LogOut,
  Store,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Megaphone,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard",  label: "Dashboard",  Icon: LayoutDashboard },
  { href: "/admin/pedidos",    label: "Pedidos",    Icon: ShoppingBag },
  { href: "/admin/productos",  label: "Productos",  Icon: LayoutGrid },
  { href: "/admin/categorias", label: "Categorías", Icon: Tag },
  { href: "/admin/anuncios",   label: "Anuncios",   Icon: Megaphone },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // No mostrar layout en login
  if (pathname === "/admin/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const currentLabel = NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-100">
      {/* ── Sidebar desktop (fija, colapsable) ── */}
      {/* Wrapper relativo para que el botón de colapso no quede recortado por overflow-hidden del aside */}
      <div className="relative hidden md:flex shrink-0">
        <motion.aside
          animate={{ width: collapsed ? 64 : 224 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="flex shrink-0 flex-col border-r border-zinc-200 bg-white overflow-hidden"
          style={{ width: collapsed ? 64 : 224 }}
        >
          {/* Logo / título */}
          <div className="flex h-14 items-center gap-2 border-b border-zinc-100 px-4 overflow-hidden">
            <span className="shrink-0 text-xl">🍬</span>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap font-semibold text-zinc-800"
                >
                  Admin Panel
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Nav items */}
          <nav className="flex flex-1 flex-col gap-1 p-2 overflow-hidden">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-amber-100 text-amber-900"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          {/* Footer nav */}
          <div className="border-t border-zinc-100 p-2 space-y-1 overflow-hidden">
            <Link
              href="/"
              title={collapsed ? "Ver tienda" : undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            >
              <Store size={15} className="shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="whitespace-nowrap"
                  >
                    Ver tienda
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <button
              onClick={logout}
              title={collapsed ? "Cerrar sesión" : undefined}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={15} className="shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="whitespace-nowrap"
                  >
                    Cerrar sesión
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.aside>

        {/* Botón colapsar — fuera del aside para no ser recortado por overflow-hidden */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="absolute -right-3 top-14 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-md text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 transition"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* ── Área principal ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4">
          {/* Hamburger — solo mobile */}
          <button
            className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Título de la sección actual */}
          <span className="text-sm font-medium text-zinc-700">
            {currentLabel}
          </span>

          {/* Logout rápido desktop */}
          <button
            onClick={logout}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 md:flex"
          >
            <LogOut size={13} />
            Salir
          </button>

          {/* Placeholder para centrar el título en mobile */}
          <div className="w-8 md:hidden" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {/* ── Drawer mobile ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl md:hidden"
            >
              <div className="flex h-14 items-center justify-between border-b border-zinc-100 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍬</span>
                  <span className="font-semibold text-zinc-800">Admin Panel</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 p-3">
                {NAV_ITEMS.map(({ href, label, Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        active
                          ? "bg-amber-100 text-amber-900"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-zinc-100 p-3 space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 hover:bg-zinc-100"
                >
                  <Store size={16} />
                  Ver tienda
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

