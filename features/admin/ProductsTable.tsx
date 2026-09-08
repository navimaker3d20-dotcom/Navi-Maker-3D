"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/format";

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  basePriceCents: number;
  stock: number;
  category: { name: string };
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-[var(--amber-tint)] text-[#7A4B0F]",
  ACTIVE: "bg-[var(--blue-tint)] text-[var(--blue-deep)]",
  ARCHIVED: "bg-[var(--line)] text-[var(--ink-soft)]",
};

export function ProductsTable() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products?pageSize=50");
    const { data } = await res.json();
    setProducts(data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function archive(slug: string) {
    if (!confirm("¿Archivar este producto? Dejará de verse en la tienda.")) return;
    await fetch(`/api/products/${slug}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-sm text-[var(--ink-soft)]">Cargando productos…</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-[var(--ink-soft)]">
          <th className="pb-2">Producto</th>
          <th className="pb-2">Categoría</th>
          <th className="pb-2">Precio</th>
          <th className="pb-2">Stock</th>
          <th className="pb-2">Estado</th>
          <th className="pb-2" />
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id} className="border-t border-[var(--line)]">
            <td className="py-2 font-medium">{p.name}</td>
            <td className="py-2 text-[var(--ink-soft)]">{p.category.name}</td>
            <td className="py-2">{formatCents(p.basePriceCents)}</td>
            <td className="py-2">{p.stock}</td>
            <td className="py-2">
              <span className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLES[p.status]}`}>
                {p.status}
              </span>
            </td>
            <td className="py-2 text-right">
              <button onClick={() => archive(p.slug)} className="text-xs text-[var(--ink-soft)] underline">
                Archivar
              </button>
            </td>
          </tr>
        ))}
        {products.length === 0 && (
          <tr>
            <td colSpan={6} className="py-8 text-center text-[var(--ink-soft)]">
              Aún no has creado productos.{" "}
              <Link href="/admin/productos/nuevo" className="text-[var(--blue-deep)] underline">
                Crea el primero
              </Link>
              .
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
