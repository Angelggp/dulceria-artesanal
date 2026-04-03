"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { Category, Product } from "@/lib/types";
import { ChevronLeft, ChevronRight, Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  image: "",
  description: "",
  stock: "",
};

// ─── Componente de zona drag-and-drop ────────────────────────────────────────
function ImageDropzone({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Solo se permiten imágenes.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64 }),
        });
        if (!res.ok) {
          const d = (await res.json()) as { error?: string };
          setUploadError(d.error ?? "Error al subir imagen.");
          setUploading(false);
          return;
        }
        const { url } = (await res.json()) as { url: string };
        onChange(url);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError("Error inesperado al subir imagen.");
      setUploading(false);
    }
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-1.5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-sm transition-colors ${
          dragging
            ? "border-amber-500 bg-amber-50"
            : "border-zinc-200 bg-zinc-50 hover:border-amber-400 hover:bg-amber-50/40"
        }`}
      >
        {uploading ? (
          <span className="animate-pulse text-sm text-zinc-500">Subiendo imagen...</span>
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="preview" className="h-28 w-auto rounded-lg object-cover shadow-sm" />
        ) : (
          <>
            <ImagePlus size={28} className="text-zinc-300" />
            <span className="text-center text-xs text-zinc-400">
              Arrastra una imagen o haz clic para seleccionar
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />
      </div>
      {/* Permite también pegar una URL manualmente */}
      <input
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 outline-none focus:ring-1 focus:ring-amber-300"
        placeholder="…o pega una URL de imagen"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function ProductosPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario unificado (crear + editar)
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [togglingVisible, setTogglingVisible] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([prodData, catData]) => {
      setProducts((prodData as { products?: Product[] }).products ?? []);
      const cats = (catData as { categories?: Category[] }).categories ?? [];
      setCategories(cats);
      setForm((f) => ({ ...f, category: cats[0]?.id ?? "" }));
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm({ ...EMPTY_FORM, category: categories[0]?.id ?? "" });
    setFormMode("create");
    setEditingId(null);
    setError("");
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function startEdit(product: Product) {
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      image: product.image,
      description: product.description,
      stock: String(product.stock),
    });
    setFormMode("edit");
    setEditingId(product.id);
    setError("");
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function cancelForm() {
    setShowForm(false);
    setFormMode("create");
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category: categories[0]?.id ?? "" });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (formMode === "create") {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
        });
        if (!res.ok) {
          const d = (await res.json()) as { error?: string };
          setError(d.error ?? "Error al crear producto.");
          return;
        }
        const { product } = (await res.json()) as { product: Product };
        setProducts((prev) => [...prev, product]);
        cancelForm();
      } else {
        if (!editingId) return;
        const res = await fetch(`/api/products/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
        });
        if (!res.ok) {
          const d = (await res.json()) as { error?: string };
          setError(d.error ?? "Error al actualizar producto.");
          return;
        }
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, ...form, price: Number(form.price), stock: Number(form.stock) }
              : p,
          ),
        );
        cancelForm();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisible(product: Product) {
    setTogglingVisible(product.id);
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !product.visible }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, visible: !product.visible } : p),
      );
    }
    setTogglingVisible(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) cancelForm();
      setDeleteTarget(null);
    } else {
      const data = (await res.json()) as { error?: string };
      setDeleteError(data.error ?? "No se pudo eliminar el producto.");
    }
    setDeleting(false);
  }

  const inputCls =
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300";

  if (loading)
    return (
      <section className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
            <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-zinc-200" />
              <div className="h-3 w-1/3 rounded bg-zinc-100" />
            </div>
          </div>
        ))}
      </section>
    );

  return (
    <section className="space-y-4">
      {/* ── Encabezado ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-zinc-800">Productos</h1>
        {!showForm ? (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 shadow-sm transition hover:bg-amber-800"
          >
            <Plus size={15} />
            Nuevo producto
          </button>
        ) : (
          <button
            onClick={cancelForm}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            <X size={15} />
            Cancelar
          </button>
        )}
      </div>

      {/* ── Formulario unificado (crear / editar) ── */}
      <div ref={formRef}>
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className={`space-y-4 rounded-2xl border p-5 shadow-sm ${
              formMode === "edit"
                ? "border-amber-300 bg-amber-50"
                : "border-zinc-200 bg-white"
            }`}
          >
            <h2 className="font-semibold text-zinc-800">
              {formMode === "edit" ? `Editando: ${form.name}` : "Nuevo producto"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Trufas de chocolate"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  className={inputCls}
                  value={form.category}
                  required
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji ? `${c.emoji} ` : ""}{c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">
                  Precio <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="25.00"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="100"
                  type="number"
                  min="0"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">
                Imagen <span className="text-red-500">*</span>
              </label>
              <ImageDropzone
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                className={inputCls}
                placeholder="Descripción del producto"
                required
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || !form.image}
                className="flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 shadow-sm transition hover:bg-amber-800 disabled:opacity-60"
              >
                {saving
                  ? "Guardando..."
                  : formMode === "edit"
                  ? "Guardar cambios"
                  : <><Plus size={14} /> Crear producto</>}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Lista de productos ── */}
      <div className="space-y-3">
        {products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 py-14 text-center">
            <p className="text-2xl">📦</p>
            <p className="mt-2 text-sm text-zinc-500">No hay productos todavía.</p>
          </div>
        )}
        {products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((product) => (
          <div
            key={product.id}
            className={`flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition ${
              editingId === product.id
                ? "border-amber-300 ring-2 ring-amber-200"
                : "border-zinc-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="h-16 w-16 shrink-0 rounded-xl object-cover shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-zinc-900">{product.name}</p>
              <p className="text-xs text-zinc-500">
                {categories.find((c) => c.id === product.category)?.name ?? product.category}
                {" · "}
                {formatCurrency(product.price)}
              </p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  product.stock === 0
                    ? "bg-red-100 text-red-600"
                    : product.stock <= 5
                    ? "bg-orange-100 text-orange-600"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {product.stock === 0 ? "Agotado" : `${product.stock} en stock`}
              </span>              {!product.visible && (
                <span className="ml-1 mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                  Oculto
                </span>
              )}            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button
                onClick={() => toggleVisible(product)}
                disabled={togglingVisible === product.id}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  product.visible
                    ? "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                } disabled:opacity-60`}
              >
                {product.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                {product.visible ? "Visible" : "Oculto"}
              </button>
              <button
                onClick={() => startEdit(product)}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
              >
                <Pencil size={12} /> Editar
              </button>
              <button
                onClick={() => setDeleteTarget(product)}
                className="flex items-center gap-1.5 rounded-xl border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
              >
                <Trash2 size={12} /> Eliminar
              </button>
            </div>
          </div>
        ))}
        {/* Paginación */}
        {products.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
            <p className="text-xs text-zinc-400">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, products.length)} de {products.length} productos
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.ceil(products.length / PAGE_SIZE) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                    p === page
                      ? "bg-amber-700 text-white"
                      : "border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(Math.ceil(products.length / PAGE_SIZE), p + 1))}
                disabled={page === Math.ceil(products.length / PAGE_SIZE)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}      </div>

      {/* ── Modal confirmar eliminación ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setDeleteTarget(null)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <h3 className="font-semibold text-zinc-900">Eliminar producto</h3>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              ¿Estás seguro de que quieres eliminar{" "}
              <span className="font-semibold text-zinc-900">{deleteTarget.name}</span>?{" "}
              Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <span className="mt-0.5 shrink-0 text-amber-500">⚠️</span>
                <p className="text-sm text-amber-800">{deleteError}</p>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(""); }}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting || !!deleteError}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                <Trash2 size={14} />
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
