import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/features/account/ProfileForm";
import { ChangePasswordForm } from "@/features/account/ChangePasswordForm";

export const metadata = { title: "Mi cuenta — Navi Maker 3D" };

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/cuenta/login?callbackUrl=/cuenta/perfil");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: { orderBy: [{ isDefault: "desc" }] } },
  });
  if (!user) redirect("/cuenta/login");

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mi cuenta</h1>
        <Link href="/cuenta/pedidos" className="text-sm text-[var(--blue-deep)] underline">
          Ver mis pedidos
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Datos personales</h2>
        <ProfileForm name={user.name} phone={user.phone} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Direcciones</h2>
        {user.addresses.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">Todavía no tienes direcciones guardadas.</p>
        ) : (
          <div className="space-y-2">
            {user.addresses.map((a) => (
              <div key={a.id} className="rounded-md border border-[var(--line)] p-3 text-sm">
                <span className="font-medium">{a.label ?? "Dirección"}</span> — {a.street} {a.exteriorNumber},{" "}
                {a.neighborhood}, {a.city}, {a.state}, CP {a.postalCode}
                {a.isDefault && <span className="ml-2 text-xs text-[var(--blue-deep)]">Predeterminada</span>}
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-[var(--ink-soft)]">
          Puedes agregar nuevas direcciones directamente en el checkout de tu próxima compra.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Seguridad</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
