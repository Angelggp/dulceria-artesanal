"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, CheckCircle, Heart, X } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Category, Product } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";

// ─── Skeleton ────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
      <div className="h-44 w-full animate-pulse bg-zinc-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-100" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-16 animate-pulse rounded bg-zinc-200" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}

// ─── Card de producto ─────────────────────────────────────────────────────────
function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const items = useCartStore((s) => s.items);
  const inCart = items.find((i) => i.product.id === product.id);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (product.stock === 0) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm cursor-pointer"
      onClick={onOpen}
    >
      <div className="relative overflow-hidden">
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }}>
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={280}
            className="h-44 w-full object-cover"
          />
        </motion.div>
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-800">
              Agotado
            </span>
          </div>
        )}
        {inCart && inCart.quantity > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-amber-700 px-2 py-0.5 text-xs font-bold text-white shadow">
            <ShoppingBag size={10} />
            {inCart.quantity}
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h2 className="font-semibold text-zinc-900 leading-tight">{product.name}</h2>
        <p className="line-clamp-2 text-sm text-zinc-500">{product.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-bold text-amber-800">
            {formatCurrency(product.price)}
          </span>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); handleAdd(); }}
            disabled={product.stock === 0}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
              added
                ? "bg-green-600 text-white"
                : product.stock === 0
                ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                : "bg-amber-700 text-amber-50 hover:bg-amber-800"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <CheckCircle size={13} />
                  ¡Listo!
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <ShoppingBag size={13} />
                  Agregar
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Modal de detalle ─────────────────────────────────────────────────────────
function ProductModal({
  product,
  isFavorite,
  onClose,
  onToggleFavorite,
}: {
  product: Product;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
}) {
  const addToCart = useCartStore((s) => s.addToCart);
  const items = useCartStore((s) => s.items);
  const inCart = items.find((i) => i.product.id === product.id);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (product.stock === 0) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="h-1 w-10 rounded-full bg-zinc-200" />
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white transition hover:bg-black/45"
        >
          <X size={16} />
        </button>

        {/* Imagen */}
        <div className="relative w-full bg-zinc-100">
          <Image
            src={product.image}
            alt={product.name}
            width={800}
            height={600}
            className="h-auto max-h-72 w-full object-contain"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-zinc-800">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold leading-tight text-zinc-900">{product.name}</h2>
              {inCart && inCart.quantity > 0 && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                  <ShoppingBag size={11} />
                  {inCart.quantity} en el carrito
                </span>
              )}
            </div>
            <span className="shrink-0 text-xl font-bold text-amber-800">
              {formatCurrency(product.price)}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-zinc-600">{product.description}</p>

          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs font-semibold text-orange-600">
              ⚠️ Solo {product.stock} disponible{product.stock !== 1 ? "s" : ""}
            </p>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggleFavorite}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                isFavorite
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-red-200 hover:text-red-500"
              }`}
            >
              <Heart size={15} fill={isFavorite ? "currentColor" : "none"} />
              {isFavorite ? "Guardado" : "Guardar"}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                added
                  ? "bg-green-600 text-white"
                  : product.stock === 0
                  ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                  : "bg-amber-700 text-amber-50 hover:bg-amber-800"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle size={15} />
                    ¡Agregado!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <ShoppingBag size={15} />
                    {product.stock === 0 ? "Agotado" : "Agregar al carrito"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Página catálogo ──────────────────────────────────────────────────────────
export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const pillsRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("dulceria_fav") ?? "[]") as string[];
    } catch { return []; }
  });

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("dulceria_fav", JSON.stringify(next));
      return next;
    });
  }

  // Leer ?cat= de la URL para pre-filtrar desde la landing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    if (cat) setActiveCategory(cat);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        const prodData = (await prodRes.json()) as { products: Product[] };
        const catData = (await catRes.json()) as { categories: Category[] };
        setProducts(prodData.products ?? []);
        setCategories(catData.categories ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const byCategory = activeCategory === "all" ? true : p.category === activeCategory;
      const byName = p.name.toLowerCase().includes(query.toLowerCase().trim());
      return byCategory && byName;
    });
  }, [activeCategory, products, query]);

  return (
    <section className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-amber-900">Catálogo</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {loading ? "Cargando..." : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar dulces..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-amber-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none ring-amber-400 focus:ring-2"
        />
      </div>

      {/* Pills de categorías */}
      <div
        ref={pillsRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        <CategoryPill
          id="all"
          emoji="✨"
          name="Todo"
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />
        {categories.map((cat) => (
          <CategoryPill
            key={cat.id}
            id={cat.id}
            emoji={cat.emoji || "🍭"}
            name={cat.name}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
          />
        ))}
      </div>

      {/* Grid de productos */}
      <motion.div
        layout
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-16 text-center"
          >
            <p className="text-4xl">🍬</p>
            <p className="mt-2 text-zinc-500">No encontramos dulces con ese filtro.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={() => setSelectedProduct(product)}
              />
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Modal de detalle */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            isFavorite={favorites.includes(selectedProduct.id)}
            onClose={() => setSelectedProduct(null)}
            onToggleFavorite={() => toggleFavorite(selectedProduct.id)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Pill de categoría ────────────────────────────────────────────────────────
function CategoryPill({
  id,
  emoji,
  name,
  active,
  onClick,
}: {
  id: string;
  emoji: string;
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
    >
      {active && (
        <motion.div
          layoutId="cat-pill-active"
          className="absolute inset-0 rounded-xl bg-amber-800"
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
      )}
      <span className={`relative flex items-center gap-1.5 ${active ? "text-amber-50" : "text-zinc-600 hover:text-zinc-900"}`}>
        <span>{emoji}</span>
        <span>{name}</span>
      </span>
    </button>
  );
}
