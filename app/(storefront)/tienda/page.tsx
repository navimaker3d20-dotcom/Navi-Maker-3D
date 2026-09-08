import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ProductCard } from "@/features/catalog/ProductCard";
import { CatalogControls } from "@/features/catalog/CatalogControls";
import { CategorySidebar } from "@/features/catalog/CategorySidebar";

export const metadata: Metadata = {
  title: "Tienda — Navi Maker 3D",
  description: "Figuras de anime, articuladas, llaveros y personalizados impresos en 3D en México.",
};

const PAGE_SIZE = 12;

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; sort?: string; page?: string };
}) {
  const page = Number(searchParams.page ?? 1);

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(searchParams.search && {
      name: { contains: searchParams.search, mode: "insensitive" },
    }),
    ...(searchParams.category && { category: { slug: searchParams.category } }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    searchParams.sort === "price_asc"
      ? { basePriceCents: "asc" }
      : searchParams.sort === "price_desc"
      ? { basePriceCents: "desc" }
      : searchParams.sort === "popular"
      ? { reviews: { _count: "desc" } }
      : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        category: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Tienda</h1>

      <div className="flex flex-col gap-8 md:flex-row">
        <CategorySidebar activeSlug={searchParams.category} />

        <div className="flex-1">
          <CatalogControls />

          {products.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--ink-soft)]">
              No encontramos productos con esos filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2 text-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                const params = new URLSearchParams({
                  ...(searchParams.search && { search: searchParams.search }),
                  ...(searchParams.category && { category: searchParams.category }),
                  ...(searchParams.sort && { sort: searchParams.sort }),
                  page: String(n),
                });
                return (
                  <Link
                    key={n}
                    href={`/tienda?${params.toString()}`}
                    className={`h-8 w-8 rounded-md text-center leading-8 ${
                      n === page ? "bg-[var(--blue)] text-white" : "border border-[var(--line)]"
                    }`}
                  >
                    {n}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
