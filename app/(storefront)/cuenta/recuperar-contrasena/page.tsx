import { AccountCard } from "@/features/account/AccountCard";
import { ForgotPasswordForm } from "@/features/account/ForgotPasswordForm";

export const metadata = { title: "Recuperar contraseña — Navi Maker 3D" };

export default function ForgotPasswordPage() {
  return (
    <AccountCard title="Recupera tu contraseña">
      <ForgotPasswordForm />
    </AccountCard>
  );
}
