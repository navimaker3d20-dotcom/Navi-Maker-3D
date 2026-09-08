import { Suspense } from "react";
import { AccountCard } from "@/features/account/AccountCard";
import { LoginForm } from "@/features/account/LoginForm";

export const metadata = { title: "Iniciar sesión — Navi Maker 3D" };

export default function LoginPage() {
  return (
    <AccountCard title="Inicia sesión">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AccountCard>
  );
}
