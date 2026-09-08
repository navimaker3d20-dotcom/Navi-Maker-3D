"use client";

import { useEffect, useState } from "react";
import { ImageUploader } from "@/features/admin/ImageUploader";

type Design = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  isPublished: boolean;
  imageUrl: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DesignsManager() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/designs");
    const { data } = await res.json();
    setDesigns(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!imageUrl) {
      setError("Sube una imagen antes de guardar");
      return;
    }

    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: slugify(name),
        description: form.get("description"),
        category: form.get("category") || undefined,
        imageUrl,
        tagNames: [],
        isPublished: true,
      }),
    });

    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError?.message ?? "No se pudo crear el diseño");
      setIsSubmitting(false);
      return;
    }

    setName("");
    setImageUrl(null);
    (e.target as HTMLFormElement).reset();
    setIsSubmitting(false);
    load();
  }

  async function togglePublished(slug: string, isPublished: boolean) {
    await fetch(`/api/designs/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished }),
    });
    load();
  }

  async function handleDelete(slug: string) {
    if (!confirm("¿Eliminar este diseño de la galería?")) return;
    await fetch(`/api/designs/${slug}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
      <form onSubmit={handleCreate} className="space-y-4 rounded-md border border-[var(--line)] p-4">
        <div>
          <label className="label">Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="input w-full" />
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea name="description" required rows={3} className="input w-full" />
        </div>
        <div>
          <label className="label">Categoría (opcional)</label>
          <input name="category" placeholder="Anime, Gaming, Decoración…" className="input w-full" />
        </div>
        <div>
          <label className="label">Imagen</label>
          <ImageUploader folder="designs" onUploaded={setImageUrl} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[var(--blue)] py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {isSubmitting ? "Guardando…" : "Publicar diseño"}
        </button>
      </form>

      <table className="h-fit w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-[var(--ink-soft)]">
            <th className="pb-2">Diseño</th>
            <th className="pb-2">Categoría</th>
            <th className="pb-2">Estado</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {designs.map((d) => (
            <tr key={d.id} className="border-t border-[var(--line)]">
              <td className="flex items-center gap-2 py-2 font-medium">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.imageUrl} alt={d.name} className="h-8 w-8 rounded object-cover" />
                {d.name}
              </td>
              <td className="py-2 text-[var(--ink-soft)]">{d.category ?? "—"}</td>
              <td className="py-2">
                <button
                  onClick={() => togglePublished(d.slug, !d.isPublished)}
                  className={`rounded px-2 py-0.5 text-xs ${
                    d.isPublished ? "bg-[var(--blue-tint)] text-[var(--blue-deep)]" : "bg-[var(--line)] text-[var(--ink-soft)]"
                  }`}
                >
                  {d.isPublished ? "Publicado" : "Oculto"}
                </button>
              </td>
              <td className="py-2 text-right">
                <button onClick={() => handleDelete(d.slug)} className="text-xs text-[var(--ink-soft)] underline">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {designs.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-[var(--ink-soft)]">
                Aún no hay diseños en la galería.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
