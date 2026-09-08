"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string; _count: { products: number } };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/categories");
    const { data } = await res.json();
    setCategories(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slugify(name) }),
    });
    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError?.message ?? "No se pudo crear la categoría");
      return;
    }
    setName("");
    load();
  }

  async function handleDelete(slug: string) {
    if (!confirm("¿Eliminar esta categoría? Solo se puede si no tiene productos asignados.")) return;
    const res = await fetch(`/api/categories/${slug}`, { method: "DELETE" });
    if (!res.ok) {
      const { error: apiError } = await res.json();
      alert(apiError?.message ?? "No se pudo eliminar");
      return;
    }
    load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la nueva categoría"
          required
          className="input flex-1"
        />
        <button type="submit" className="rounded-md bg-[var(--blue)] px-4 py-2 text-sm font-medium text-white">
          Agregar
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-[var(--ink-soft)]">
            <th className="pb-2">Categoría</th>
            <th className="pb-2">Productos</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-t border-[var(--line)]">
              <td className="py-2 font-medium">{c.name}</td>
              <td className="py-2 text-[var(--ink-soft)]">{c._count.products}</td>
              <td className="py-2 text-right">
                <button onClick={() => handleDelete(c.slug)} className="text-xs text-[var(--ink-soft)] underline">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-[var(--ink-soft)]">
                Aún no hay categorías.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
