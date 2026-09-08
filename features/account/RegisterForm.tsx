"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { trackSignUp } from "@/lib/analytics/events";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError?.message ?? "No se pudo crear la cuenta");
      setIsSubmitting(false);
      return;
    }

    trackSignUp("credentials");

    // Auto-login tras registrarse, para no pedirle que inicie sesión dos veces
    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nombre completo</label>
        <input name="name" required className="input w-full" />
      </div>
      <div>
        <label className="label">Correo electrónico</label>
        <input name="email" type="email" required className="input w-full" />
      </div>
      <div>
        <label className="label">Teléfono (opcional)</label>
        <input name="phone" className="input w-full" />
      </div>
      <div>
        <label className="label">Contraseña</label>
        <input name="password" type="password" required minLength={8} className="input w-full" />
        <p className="mt-1 text-[11px] text-[var(--ink-soft)]">
          Mínimo 8 caracteres, con una mayúscula y un número.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-[var(--blue)] py-2.5 text-sm font-medium text-white disabled:opacity-40"
      >
        {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="text-center text-xs text-[var(--ink-soft)]">
        ¿Ya tienes cuenta?{" "}
        <a href="/cuenta/login" className="underline">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
