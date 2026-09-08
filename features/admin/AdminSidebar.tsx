"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/disenos", label: "Diseños" },
  { href: "/admin/cupones", label: "Cupones" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export function AdminSidebar({ userName, role }: { userName: string; role: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col bg-[var(--navy)] text-white">
      <div className="px-5 py-5 text-sm font-semibold">Navi Maker 3D — Admin</div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active ? "bg-[var(--blue)] text-white" : "text-[#AEB6D6] hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4 text-xs text-white/60">
        <div className="truncate font-medium text-white">{userName}</div>
        <div className="mb-3">{role === "SUPER_ADMIN" ? "Super admin" : "Administrador"}</div>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[var(--blue-tint)] underline">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
