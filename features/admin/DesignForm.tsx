"use client";

import { useState } from "react";
import { ImageUploader } from "@/features/admin/ImageUploader";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORIES = ["Anime", "Gaming", "Articulados", "Decoración", "Personalizados"];

export function DesignForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!imageUrl) {
      setError("Sube una imagen antes de guardar");
      return;
    }

    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);
    const tags = String(form.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await fetch("/api/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: slugify(name),
        description: form.get("description"),
        category: form.get("category"),
        tagNames: tags,
        imageUrl,
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
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-md border border-[var(--line)] p-4">
      <div>
        <label className="label">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="input w-full" />
      </div>
      <div>
        <label className="label">Descripción</label>
        <textarea name="description" required rows={2} className="input w-full" />
      </div>
      <div>
        <label className="label">Categoría</label>
        <select name="category" className="input w-full">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Tags (separados por coma)</label>
        <input name="tags" placeholder="dragón, fantasía, articulado" className="input w-full" />
      </div>
      <div>
        <label className="label">Imagen</label>
        <ImageUploader folder="designs" onUploaded={setImageUrl} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-[var(--blue)] px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {isSubmitting ? "Guardando…" : "Publicar diseño"}
      </button>
    </form>
  );
}
