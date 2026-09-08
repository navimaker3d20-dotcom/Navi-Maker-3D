"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackLogin } from "@/lib/analytics/events";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Correo o contraseña incorrectos");
      setIsSubmitting(false);
      return;
    }

    trackLogin("credentials");
    router.push(searchParams.get("callbackUrl") ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Correo electrónico</label>
        <input name="email" type="email" required className="input w-full" />
      </div>
      <div>
        <label className="label">Contraseña</label>
        <input name="password" type="password" required className="input w-full" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-[var(--blue)] py-2.5 text-sm font-medium text-white disabled:opacity-40"
      >
        {isSubmitting ? "Entrando…" : "Iniciar sesión"}
      </button>

      <div className="flex justify-between text-xs text-[var(--ink-soft)]">
        <a href="/cuenta/registro" className="underline">
          Crear cuenta
        </a>
        <a href="/cuenta/recuperar-contrasena" className="underline">
          Olvidé mi contraseña
        </a>
      </div>
    </form>
  );
}
