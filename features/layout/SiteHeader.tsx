"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/hooks/useCart";

const NAV_LINKS = [
  { href: "/tienda", label: "Tienda" },
  { href: "/disenos", label: "Diseños" },
];

export function SiteHeader() {
  const { data: session } = useSession();
  const { totalQuantity } = useCart();

  return (
    <header className="border-b border-white/10 bg-[var(--navy)] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-sm font-semibold">
          Navi Maker 3D
        </Link>

        <nav className="hidden gap-6 text-sm text-[#AEB6D6] sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          {session?.user ? (
            <div className="hidden items-center gap-4 sm:flex">
              <Link href="/cuenta/perfil" className="text-[#AEB6D6] hover:text-white">
                {session.user.name?.split(" ")[0]}
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[#AEB6D6] hover:text-white">
                Salir
              </button>
            </div>
          ) : (
            <Link href="/cuenta/login" className="hidden text-[#AEB6D6] hover:text-white sm:inline">
              Iniciar sesión
            </Link>
          )}

          <Link href="/carrito" className="relative flex items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalQuantity > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--blue)] text-[10px]">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
