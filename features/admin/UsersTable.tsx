"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
  _count: { orders: number };
};

export function UsersTable({ currentUserRole }: { currentUserRole: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const canEditRoles = currentUserRole === "SUPER_ADMIN";

  useEffect(() => {
    fetch("/api/admin/users?pageSize=50")
      .then((r) => r.json())
      .then(({ data }) => setUsers(data.items))
      .finally(() => setLoading(false));
  }, []);

  async function updateRole(id: string, role: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: role as AdminUser["role"] } : u)));
    } else {
      const { error } = await res.json();
      alert(error?.message ?? "No se pudo actualizar el rol");
    }
  }

  if (loading) return <p className="text-sm text-[var(--ink-soft)]">Cargando usuarios…</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-[var(--ink-soft)]">
          <th className="pb-2">Nombre</th>
          <th className="pb-2">Email</th>
          <th className="pb-2">Pedidos</th>
          <th className="pb-2">Rol</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-t border-[var(--line)]">
            <td className="py-2 font-medium">{u.name}</td>
            <td className="py-2 text-[var(--ink-soft)]">{u.email}</td>
            <td className="py-2">{u._count.orders}</td>
            <td className="py-2">
              {canEditRoles ? (
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  className="rounded border border-[var(--line-strong)] px-2 py-1 text-xs"
                >
                  <option value="CUSTOMER">Cliente</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super admin</option>
                </select>
              ) : (
                <span className="text-xs text-[var(--ink-soft)]">{u.role}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
