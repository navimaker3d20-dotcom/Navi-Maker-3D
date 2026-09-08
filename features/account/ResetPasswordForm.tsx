"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("El enlace no es válido, solicita uno nuevo.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: form.get("password") }),
    });

    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError?.message ?? "No se pudo actualizar la contraseña");
      setIsSubmitting(false);
      return;
    }

    router.push("/cuenta/login");
  }

  if (!token) {
    return <p className="text-sm text-red-600">Este enlace no es válido. Solicita uno nuevo.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nueva contraseña</label>
        <input name="password" type="password" required minLength={8} className="input w-full" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-[var(--blue)] py-2.5 text-sm font-medium text-white disabled:opacity-40"
      >
        {isSubmitting ? "Guardando…" : "Actualizar contraseña"}
      </button>
    </form>
  );
}
