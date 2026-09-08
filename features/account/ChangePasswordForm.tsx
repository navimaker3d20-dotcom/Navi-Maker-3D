"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
      }),
    });

    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError?.message ?? "No se pudo actualizar la contraseña");
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Contraseña actual</label>
        <input name="currentPassword" type="password" required className="input w-full" />
      </div>
      <div>
        <label className="label">Nueva contraseña</label>
        <input name="newPassword" type="password" required minLength={8} className="input w-full" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-[var(--blue-deep)]">Contraseña actualizada.</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md border border-[var(--line-strong)] px-5 py-2 text-sm font-medium disabled:opacity-40"
      >
        {isSubmitting ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
