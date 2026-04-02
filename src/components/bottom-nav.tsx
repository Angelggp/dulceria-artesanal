"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart-store";

const navItems = [
  { href: "/",         label: "Inicio",   Icon: Home },
  { href: "/catalogo", label: "Catálogo", Icon: LayoutGrid },
  { href: "/carrito",  label: "Carrito",  Icon: ShoppingBag, badge: true },
  { href: "/checkout", label: "Pedido",   Icon: ClipboardList },
];

export default function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-amber-200 bg-amber-50/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, Icon, badge }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1"
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 rounded-xl bg-amber-200"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">
                <Icon
                  size={20}
                  className={active ? "text-amber-900" : "text-zinc-500"}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {badge && totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-700 text-[9px] font-bold text-white"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </span>
              <span className={`relative text-[10px] ${active ? "font-semibold text-amber-900" : "text-zinc-500"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
