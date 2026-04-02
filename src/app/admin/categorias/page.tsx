"use client";

import { useEffect, useRef, useState } from "react";
import { Category } from "@/lib/types";
import { Pencil, Plus, Trash2, X } from "lucide-react";

function slugPreview(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EMPTY_FORM = { name: "", emoji: "" };

export default function CategoriasPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories((d as { categories?: Category[] }).categories ?? []))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormMode("create");
    setEditingId(null);
    setError("");
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function startEdit(cat: Category) {
    setForm({ name: cat.name, emoji: cat.emoji });
    setFormMode("edit");
    setEditingId(cat.id);
    setError("");
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function cancelForm() {
    setShowForm(false);
    setFormMode("create");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (formMode === "create") {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name.trim(), emoji: form.emoji.trim() }),
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
        cancelForm();
      } else {
        if (!editingId) return;
        const res = await fetch(`/api/admin/categories/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name.trim(), emoji: form.emoji.trim() }),
        });
        if (!res.ok) {
          const d = (await res.json()) as { error?: string };
          setError(d.error ?? "Error al actualizar categoría.");
          return;
        }
        setCategories((prev) =>
          prev
            .map((c) =>
              c.id === editingId ? { ...c, name: form.name.trim(), emoji: form.emoji.trim() } : c,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        cancelForm();
      }
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteError("");
    const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) cancelForm();
      setDeleteTarget(null);
    } else {
      const data = (await res.json()) as { error?: string };
      setDeleteError(data.error ?? "No se pudo eliminar la categoría.");
    }
    setDeletingId(null);
  }

  const inputCls =
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300";

  return (
    <>
      <section className="space-y-5">
        {/* Encabezado */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-zinc-800">Categorías</h1>
            <p className="text-sm text-zinc-500">{categories.length} categorías registradas</p>
          </div>
          {!showForm ? (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 shadow-sm transition hover:bg-amber-800"
            >
              <Plus size={15} />
              Nueva categoría
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

        {/* Formulario */}
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
                {formMode === "edit" ? `Editando: ${form.emoji} ${form.name}` : "Nueva categoría"}
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Emoji</label>
                  <input
                    className={inputCls}
                    placeholder="🍫"
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputCls}
                    placeholder="Chocolates"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {formMode === "create" && form.name && (
                    <p className="text-xs text-zinc-400">
                      ID:{" "}
                      <code className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
                        {slugPreview(form.name)}
                      </code>
                    </p>
                  )}
                  {formMode === "edit" && (
                    <p className="text-xs text-zinc-400">
                      ID: <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-500">{editingId}</code>{" "}
                      <span className="text-zinc-300">(no cambia)</span>
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 shadow-sm transition hover:bg-amber-800 disabled:opacity-60"
                >
                  {saving
                    ? "Guardando..."
                    : formMode === "edit"
                    ? "Guardar cambios"
                    : <><Plus size={14} /> Agregar</>}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Lista */}
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
                className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                  editingId === cat.id ? "bg-amber-50" : ""
                } ${i < categories.length - 1 ? "border-b border-zinc-100" : ""}`}
              >
                <span className="w-8 text-center text-2xl">{cat.emoji || "🏷️"}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">{cat.name}</p>
                  <code className="text-xs text-zinc-400">{cat.id}</code>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => startEdit(cat)}
                    className="rounded-lg border border-zinc-200 p-2 text-zinc-400 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    disabled={deletingId === cat.id}
                    className="rounded-lg border border-red-100 p-2 text-red-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
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
              ? Los productos de esta categoría quedarán sin categoría válida.
            </p>
            {deleteError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <span className="mt-0.5 shrink-0 text-amber-500">⚠️</span>
                <p className="text-sm text-amber-800">{deleteError}</p>
              </div>
            )}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(""); }}
                className="flex-1 rounded-xl border border-zinc-200 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={!!deletingId || !!deleteError}
                className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deletingId ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
