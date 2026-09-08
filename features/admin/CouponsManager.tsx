"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  isActive: boolean;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string;
};

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/coupons");
    const { data } = await res.json();
    setCoupons(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    const isPercentage = form.get("discountType") === "PERCENTAGE";
    const rawValue = Number(form.get("discountValue"));

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.get("code"),
        discountType: form.get("discountType"),
        // Si es descuento fijo, el admin lo captura en pesos y aquí se pasa a centavos
        discountValue: isPercentage ? rawValue : Math.round(rawValue * 100),
        startsAt: new Date().toISOString(),
        expiresAt: new Date(String(form.get("expiresAt"))).toISOString(),
        maxUsesPerUser: 1,
      }),
    });

    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError?.message ?? "No se pudo crear el cupón");
      return;
    }

    (e.target as HTMLFormElement).reset();
    load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3 rounded-md border border-[var(--line)] p-4">
        <input name="code" placeholder="Código (ej. VERANO10)" required className="input col-span-2" />
        <select name="discountType" className="input">
          <option value="PERCENTAGE">Porcentaje (%)</option>
          <option value="FIXED">Monto fijo (MXN)</option>
        </select>
        <input name="discountValue" type="number" min="1" placeholder="Valor" required className="input" />
        <div className="col-span-2">
          <label className="label">Expira</label>
          <input name="expiresAt" type="date" required className="input w-full" />
        </div>
        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
        <button type="submit" className="col-span-2 rounded-md bg-[var(--blue)] py-2 text-sm font-medium text-white">
          Crear cupón
        </button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-[var(--ink-soft)]">
            <th className="pb-2">Código</th>
            <th className="pb-2">Descuento</th>
            <th className="pb-2">Usos</th>
            <th className="pb-2">Expira</th>
            <th className="pb-2">Activo</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} className="border-t border-[var(--line)]">
              <td className="py-2 font-medium">{c.code}</td>
              <td className="py-2">
                {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `$${(c.discountValue / 100).toFixed(2)}`}
              </td>
              <td className="py-2 text-[var(--ink-soft)]">
                {c.usedCount}
                {c.maxUses ? ` / ${c.maxUses}` : ""}
              </td>
              <td className="py-2 text-[var(--ink-soft)]">
                {new Intl.DateTimeFormat("es-MX", { dateStyle: "short" }).format(new Date(c.expiresAt))}
              </td>
              <td className="py-2">
                <button
                  onClick={() => toggleActive(c.id, !c.isActive)}
                  className={`rounded px-2 py-0.5 text-xs ${
                    c.isActive ? "bg-[var(--blue-tint)] text-[var(--blue-deep)]" : "bg-[var(--line)] text-[var(--ink-soft)]"
                  }`}
                >
                  {c.isActive ? "Activo" : "Inactivo"}
                </button>
              </td>
            </tr>
          ))}
          {coupons.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-[var(--ink-soft)]">
                Aún no hay cupones.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
