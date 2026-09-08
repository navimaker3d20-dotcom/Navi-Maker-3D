"use client";

import { useEffect, useState } from "react";

type Design = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  isPublished: boolean;
};

export function DesignsTable({ reloadKey }: { reloadKey: number }) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/designs")
      .then((r) => r.json())
      .then(({ data }) => setDesigns(data))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  async function handleDelete(slug: string) {
    if (!confirm("¿Eliminar este diseño de la galería?")) return;
    await fetch(`/api/designs/${slug}`, { method: "DELETE" });
    setDesigns((prev) => prev.filter((d) => d.slug !== slug));
  }

  if (loading) return <p className="text-sm text-[var(--ink-soft)]">Cargando diseños…</p>;

  return (
    <table className="w-full text-sm">
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
            <td className="py-2 font-medium">{d.name}</td>
            <td className="py-2 text-[var(--ink-soft)]">{d.category ?? "—"}</td>
            <td className="py-2">
              <span
                className={`rounded px-2 py-0.5 text-xs ${
                  d.isPublished ? "bg-[var(--blue-tint)] text-[var(--blue-deep)]" : "bg-[var(--line)] text-[var(--ink-soft)]"
                }`}
              >
                {d.isPublished ? "Publicado" : "Oculto"}
              </span>
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
  );
}
