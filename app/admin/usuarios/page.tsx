import { auth } from "@/auth";
import { UsersTable } from "@/features/admin/UsersTable";

export const metadata = { title: "Usuarios — Admin Navi Maker 3D" };

export default async function AdminUsersPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Usuarios</h1>
      <div className="rounded-md border border-[var(--line)] bg-[var(--card)] p-5">
        <UsersTable currentUserRole={session?.user.role ?? "ADMIN"} />
      </div>
    </div>
  );
}
