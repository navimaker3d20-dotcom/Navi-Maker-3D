import { AccountCard } from "@/features/account/AccountCard";
import { RegisterForm } from "@/features/account/RegisterForm";

export const metadata = { title: "Crear cuenta — Navi Maker 3D" };

export default function RegisterPage() {
  return (
    <AccountCard title="Crea tu cuenta">
      <RegisterForm />
    </AccountCard>
  );
}
