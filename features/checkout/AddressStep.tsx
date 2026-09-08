"use client";

import { useEffect, useState } from "react";

type Address = {
  id: string;
  label?: string;
  fullName: string;
  street: string;
  exteriorNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export function AddressStep({
  selectedId,
  onSelect,
  onNext,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then(({ data }: { data: Address[] }) => {
        setAddresses(data);
        const preferred = data.find((a) => a.isDefault) ?? data[0];
        if (preferred && !selectedId) onSelect(preferred.id);
        if (data.length === 0) setShowForm(true);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, isDefault: addresses.length === 0 }),
    });
    const { data } = await res.json();
    setAddresses((prev) => [...prev, data]);
    onSelect(data.id);
    setShowForm(false);
  }

  if (loading) return <p className="text-sm text-[var(--ink-soft)]">Cargando direcciones…</p>;

  return (
    <div className="space-y-4">
      {addresses.map((a) => (
        <label
          key={a.id}
          className={`block cursor-pointer rounded-md border p-4 text-sm ${
            selectedId === a.id ? "border-[var(--blue)] bg-[var(--blue-tint)]" : "border-[var(--line)]"
          }`}
        >
          <input
            type="radio"
            name="address"
            className="mr-2"
            checked={selectedId === a.id}
            onChange={() => onSelect(a.id)}
          />
          <span className="font-medium">{a.label ?? "Dirección"}</span> — {a.fullName}
          <div className="mt-1 text-[var(--ink-soft)]">
            {a.street} {a.exteriorNumber}, {a.neighborhood}, {a.city}, {a.state}, CP {a.postalCode}
          </div>
        </label>
      ))}

      {!showForm && (
        <button
          className="text-sm text-[var(--blue-deep)] underline"
          onClick={() => setShowForm(true)}
        >
          + Agregar nueva dirección
        </button>
      )}

      {showForm && (
        <form
          action={handleCreate}
          className="grid grid-cols-2 gap-3 rounded-md border border-[var(--line)] p-4"
        >
          <input name="label" placeholder="Etiqueta (Casa, Trabajo)" className="input col-span-2" />
          <input name="fullName" placeholder="Nombre completo" required className="input col-span-2" />
          <input name="phone" placeholder="Teléfono" required className="input col-span-2" />
          <input name="street" placeholder="Calle" required className="input col-span-2" />
          <input name="exteriorNumber" placeholder="Número ext." required className="input" />
          <input name="interiorNumber" placeholder="Número int. (opcional)" className="input" />
          <input name="neighborhood" placeholder="Colonia" required className="input col-span-2" />
          <input name="city" placeholder="Ciudad" required className="input" />
          <input name="state" placeholder="Estado" required className="input" />
          <input name="postalCode" placeholder="Código postal" required className="input" />
          <button
            type="submit"
            className="col-span-2 mt-1 rounded-md bg-[var(--blue)] py-2 text-sm font-medium text-white"
          >
            Guardar dirección
          </button>
        </form>
      )}

      <button
        disabled={!selectedId}
        onClick={onNext}
        className="mt-4 w-full rounded-md bg-[var(--blue)] py-2.5 text-sm font-medium text-white disabled:opacity-40"
      >
        Continuar
      </button>
    </div>
  );
}
