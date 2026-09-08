import { Suspense } from "react";
import { AccountCard } from "@/features/account/AccountCard";
import { ResetPasswordForm } from "@/features/account/ResetPasswordForm";

export const metadata = { title: "Restablecer contraseña — Navi Maker 3D" };

export default function ResetPasswordPage() {
  return (
    <AccountCard title="Nueva contraseña">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AccountCard>
  );
}
