"use client";

import { useEffect, useState } from "react";
import { Category } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

function slugPreview(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories((d as { categories?: Category[] }).categories ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), emoji: emoji.trim() }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Error al crear categoría.");
        return;
      }
      const { category } = (await res.json()) as { category: Category };
      setCategories((prev) =>
        [...prev, category].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      setEmoji("");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setDeleteTarget(cat);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeletingId(null);
    setDeleteTarget(null);
  }

  const slug = slugPreview(name);

  return (
    <>
      <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-800">Categorías</h1>
        <p className="text-sm text-zinc-500">{categories.length} categorías registradas</p>
      </div>

      {/* ── Formulario ── */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 font-semibold text-zinc-700">Nueva categoría</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Emoji */}
          <div className="space-y-1.5">
            <label htmlFor="cat-emoji" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Emoji
            </label>
            <input
              id="cat-emoji"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="🍫"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
            />
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <label htmlFor="cat-name" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="Chocolates"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {slug && (
              <p className="text-xs text-zinc-400">
                ID:{" "}
                <code className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">{slug}</code>
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          disabled={saving}
          className="mt-4 flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-medium text-amber-50 transition hover:bg-amber-800 disabled:opacity-60"
        >
          <Plus size={14} />
          {saving ? "Guardando..." : "Agregar categoría"}
        </button>
      </form>

      {/* ── Lista ── */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-200" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-12 text-center">
          <p className="text-2xl">🏷️</p>
          <p className="mt-2 text-sm text-zinc-500">No hay categorías todavía.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`flex items-center gap-4 px-4 py-3 ${
                i < categories.length - 1 ? "border-b border-zinc-100" : ""
              }`}
            >
              <span className="text-2xl w-8 text-center">{cat.emoji || "🍭"}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900">{cat.name}</p>
                <code className="text-xs text-zinc-400">{cat.id}</code>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                disabled={deletingId === cat.id}
                className="shrink-0 rounded-lg border border-red-100 p-2 text-red-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>

    {/* Modal confirmar eliminación */}
      {deleteTarget && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onClick={() => setDeleteTarget(null)}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-zinc-900">Eliminar categoría</h3>
          </div>
          <p className="mt-2 text-sm text-zinc-600">
            ¿Eliminar{" "}
            <span className="font-semibold text-zinc-900">
              {deleteTarget.emoji} {deleteTarget.name}
            </span>
            ? Los productos asociados quedarán sin categoría válida.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={!!deletingId}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              <Trash2 size={14} />
              {deletingId ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
}


