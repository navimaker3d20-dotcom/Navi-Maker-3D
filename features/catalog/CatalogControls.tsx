"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { trackSearch } from "@/lib/analytics/events";

const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "popular", label: "Más populares" },
];

export function CatalogControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // cualquier cambio de filtro reinicia la paginación
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) trackSearch(search.trim());
    updateParam("search", search.trim());
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos…"
          className="input w-full max-w-xs"
        />
      </form>

      <select
        defaultValue={searchParams.get("sort") ?? "newest"}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="input"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
