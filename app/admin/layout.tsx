import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/features/admin/AdminSidebar";

// El middleware (Fase 4) ya bloquea /admin/** a nivel de Edge para quien no
// tenga rol ADMIN/SUPER_ADMIN. Esta comprobación aquí es defensa en
// profundidad — nunca hay que asumir que una sola capa de seguridad basta.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/cuenta/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userName={session.user.name ?? ""} role={session.user.role} />
      <main className="flex-1 bg-[var(--paper)] p-8">{children}</main>
    </div>
  );
}
