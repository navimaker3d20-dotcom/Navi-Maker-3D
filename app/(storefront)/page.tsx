import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/features/catalog/ProductCard";

export default async function HomePage() {
  const [categories, featuredProducts, recentDesigns] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      take: 4,
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { images: { take: 1, orderBy: { order: "asc" } }, category: { select: { name: true } } },
    }),
    prisma.design.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <div>
      <section className="border-b border-[var(--line)] bg-gradient-to-b from-[var(--navy)] to-[var(--navy)] py-16 text-center text-white">
        <div className="mx-auto max-w-lg px-6">
          <h1 className="text-3xl font-semibold">
            Ideas que <span className="text-[var(--blue-tint)]">toman forma</span>
          </h1>
          <p className="mt-3 text-sm text-[#AEB6D6]">
            Figuras de anime, articuladas, llaveros y diseños personalizados, impresos en 3D en México.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/tienda" className="rounded-md bg-[var(--blue)] px-5 py-2.5 text-sm font-medium">
              Ver tienda
            </Link>
            <Link
              href="/disenos"
              className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium"
            >
              Diseños personalizados
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-4 text-lg font-semibold">Categorías</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda?category=${c.slug}`}
              className="rounded-md border border-[var(--line)] bg-[var(--card)] p-4 text-sm font-medium"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Productos destacados</h2>
            <Link href="/tienda" className="text-xs text-[var(--blue-deep)]">
              Ver catálogo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {recentDesigns.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Diseños recientes</h2>
            <Link href="/disenos" className="text-xs text-[var(--blue-deep)]">
              Ver galería
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recentDesigns.map((d) => (
              <div key={d.id} className="overflow-hidden rounded-md border border-[var(--line)]">
                <div className="aspect-square bg-[var(--navy)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.imageUrl} alt={d.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-2 text-sm">{d.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-[var(--line)] bg-[var(--navy)] py-14 text-center text-white">
        <h2 className="text-xl font-semibold">¿Tienes una idea?</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[#AEB6D6]">
          Podemos convertirla en una figura impresa en 3D, hecha a tu medida.
        </p>
        <Link
          href="/disenos"
          className="mt-5 inline-block rounded-md bg-[var(--blue)] px-5 py-2.5 text-sm font-medium"
        >
          Solicitar diseño personalizado
        </Link>
      </section>
    </div>
  );
}
