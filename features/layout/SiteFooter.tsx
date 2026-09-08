import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[var(--navy)] text-[#AEB6D6]">
      <div className="mx-auto max-w-6xl px-6 py-8 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} Navi Maker 3D. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/tienda">Tienda</Link>
            <Link href="/disenos">Diseños</Link>
            <Link href="/cuenta/pedidos">Mis pedidos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
