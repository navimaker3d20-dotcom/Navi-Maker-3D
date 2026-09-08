import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductQueryInput } from "@/schemas/product.schema";

// Capa compartida entre /api/products (consumo client-side, filtros dinámicos)
// y las páginas SSR de /tienda y /producto/[slug] (para que la primera carga
// venga renderizada en servidor, buena para SEO y performance).

export async function listProducts(query: ProductQueryInput) {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(query.search && { name: { contains: query.search, mode: "insensitive" } }),
    ...(query.category && { category: { slug: query.category } }),
    ...((query.minPriceCents || query.maxPriceCents) && {
      basePriceCents: { gte: query.minPriceCents, lte: query.maxPriceCents },
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === "price_asc"
      ? { basePriceCents: "asc" }
      : query.sort === "price_desc"
      ? { basePriceCents: "desc" }
      : query.sort === "popular"
      ? { reviews: { _count: "desc" } }
      : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: { select: { name: true, slug: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });

  if (!product || product.status !== "ACTIVE") return null;

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, status: "ACTIVE" },
    take: 4,
    include: { images: { take: 1, orderBy: { order: "asc" } } },
  });

  return { product, related };
}

export async function listCategoriesForNav() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { name: true, slug: true, _count: { select: { products: true } } },
  });
}
