"use client";

import { useEffect, useRef, useState } from "react";
import { Banner } from "@/lib/types";
import { Megaphone, Pencil, Plus, Trash2, X, Eye, EyeOff } from "lucide-react";

const COLORS = [
  { value: "amber",   label: "Ámbar",    preview: "bg-amber-400"   },
  { value: "rose",    label: "Rosa",     preview: "bg-rose-500"    },
  { value: "violet",  label: "Violeta",  preview: "bg-violet-600"  },
  { value: "emerald", label: "Verde",    preview: "bg-emerald-500" },
  { value: "sky",     label: "Azul",     preview: "bg-sky-500"     },
  { value: "zinc",    label: "Oscuro",   preview: "bg-zinc-800"    },
];

const EMPTY_FORM = { text: "", color: "amber" };

export default function AnunciosPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  useEffect(() => {
    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then((d: { banners?: Banner[] }) => setBanners(d.banners ?? []))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormMode("create");
    setEditingId(null);
    setError("");
    setShowForm(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  }

  function startEdit(banner: Banner) {
    setForm({ text: banner.text, color: banner.color });
    setFormMode("edit");
    setEditingId(banner.id);
    setError("");
    setShowForm(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
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
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: form.text.trim(), color: form.color }),
        });
        if (!res.ok) {
          const d = (await res.json()) as { error?: string };
          setError(d.error ?? "Error al crear anuncio.");
          return;
        }
        const { banner } = (await res.json()) as { banner: Banner };
        setBanners((prev) => [...prev, banner]);
        cancelForm();
      } else {
        if (!editingId) return;
        const res = await fetch(`/api/admin/banners/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: form.text.trim(), color: form.color }),
        });
        if (!res.ok) {
          const d = (await res.json()) as { error?: string };
          setError(d.error ?? "Error al actualizar anuncio.");
          return;
        }
        const { banner: updated } = (await res.json()) as { banner: Banner };
        setBanners((prev) =>
          prev.map((b) => (b.id === editingId ? updated : b)),
        );
        cancelForm();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(banner: Banner) {
    setTogglingId(banner.id);
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !banner.active }),
    });
    if (res.ok) {
      const { banner: updated } = (await res.json()) as { banner: Banner };
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
    }
    setTogglingId(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    await fetch(`/api/admin/banners/${deleteTarget.id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeletingId(null);
  }

  const colorInfo = (val: string) => COLORS.find((c) => c.value === val) ?? COLORS[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-800 sm:text-2xl">Anuncios</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Gestiona el ticker promocional que aparece encima del header.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-500 active:scale-95 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo anuncio
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div
          ref={formRef}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-700">
              {formMode === "create" ? "Nuevo anuncio" : "Editar anuncio"}
            </h2>
            <button
              onClick={cancelForm}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Texto */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Texto del anuncio
              </label>
              <input
                type="text"
                value={form.text}
                onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                placeholder="Domicilios gratis en la ciudad 🛵"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                required
                maxLength={120}
              />
            </div>

            {/* Color */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Color de fondo
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, color: c.value }))}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition ${
                      form.color === c.value
                        ? "border-zinc-900 shadow"
                        : "border-transparent hover:border-zinc-300"
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full ${c.preview}`} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="overflow-hidden rounded-xl">
              <div
                className={`${colorInfo(form.color).preview} py-2 text-center text-sm font-semibold`}
                style={{ color: ["zinc"].includes(form.color) ? "white" : undefined }}
              >
                {form.text || "Vista previa del anuncio…"}
              </div>
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelForm}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-500 disabled:opacity-60"
              >
                {saving ? "Guardando…" : formMode === "create" ? "Crear anuncio" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-10 text-center">
          <Megaphone className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-400">No hay anuncios aún.</p>
          <p className="text-xs text-zinc-400">Crea uno para que aparezca en el ticker.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`rounded-2xl border ${
                banner.active
                  ? "border-zinc-200 bg-white"
                  : "border-zinc-100 bg-zinc-50 opacity-60"
              } p-3 shadow-sm transition sm:p-4`}
            >
              {/* Fila principal: color + texto + badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`h-8 w-1.5 shrink-0 rounded-full ${colorInfo(banner.color).preview}`}
                />
                <span className="flex-1 text-sm font-medium leading-snug text-zinc-700">
                  {banner.text}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    banner.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {banner.active ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Fila de acciones — separada para mayor área táctil en móvil */}
              <div className="mt-2.5 flex items-center gap-1 border-t border-zinc-100 pt-2.5">
                <button
                  onClick={() => toggleActive(banner)}
                  disabled={togglingId === banner.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 disabled:opacity-40"
                >
                  {banner.active ? (
                    <><EyeOff className="h-3.5 w-3.5" /> Desactivar</>
                  ) : (
                    <><Eye className="h-3.5 w-3.5" /> Activar</>
                  )}
                </button>
                <div className="h-4 w-px bg-zinc-200" />
                <button
                  onClick={() => startEdit(banner)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
                <div className="h-4 w-px bg-zinc-200" />
                <button
                  onClick={() => setDeleteTarget(banner)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal confirmación borrado */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 font-semibold text-zinc-800">¿Eliminar anuncio?</h3>
            <p className="mb-5 text-sm text-zinc-500">
              &ldquo;{deleteTarget.text}&rdquo; se eliminará permanentemente.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === deleteTarget.id}
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                {deletingId === deleteTarget.id ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
