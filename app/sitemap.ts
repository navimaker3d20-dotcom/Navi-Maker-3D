import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://navimaker3d.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, designs] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.design.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/tienda`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/disenos`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/producto/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Los diseños no tienen ruta de detalle propia todavía (Fase 2), así que
  // se referencian con un anchor a la galería filtrada — cuando exista
  // /disenos/[slug], aquí se cambia por esa URL sin tocar el resto.
  const designRoutes: MetadataRoute.Sitemap = designs.map((d) => ({
    url: `${BASE_URL}/disenos#${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...productRoutes, ...designRoutes];
}
