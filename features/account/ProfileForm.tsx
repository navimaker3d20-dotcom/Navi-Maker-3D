"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileForm({ name, phone }: { name: string; phone: string | null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);

    await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), phone: form.get("phone") || undefined }),
    });

    setIsSubmitting(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nombre</label>
        <input name="name" defaultValue={name} required className="input w-full" />
      </div>
      <div>
        <label className="label">Teléfono</label>
        <input name="phone" defaultValue={phone ?? ""} className="input w-full" />
      </div>
      {saved && <p className="text-xs text-[var(--blue-deep)]">Cambios guardados.</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-[var(--blue)] px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
