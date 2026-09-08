"use client";

import { useState } from "react";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });

    // Siempre mostramos el mismo mensaje de éxito, exista o no la cuenta
    // (el backend hace lo mismo) — así no se puede usar este formulario
    // para averiguar qué correos están registrados.
    setSent(true);
    setIsSubmitting(false);
  }

  if (sent) {
    return (
      <p className="text-sm text-[var(--ink-soft)]">
        Si el correo existe, te enviamos instrucciones para recuperar tu contraseña.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Correo electrónico</label>
        <input name="email" type="email" required className="input w-full" />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-[var(--blue)] py-2.5 text-sm font-medium text-white disabled:opacity-40"
      >
        {isSubmitting ? "Enviando…" : "Enviar instrucciones"}
      </button>
    </form>
  );
}
