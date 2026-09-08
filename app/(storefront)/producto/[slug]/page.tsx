import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/features/catalog/ProductGallery";
import { ProductPurchasePanel } from "@/features/catalog/ProductPurchasePanel";
import { formatCents } from "@/lib/format";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product || product.status !== "ACTIVE") return { title: "Producto no encontrado" };

  const title = `${product.name} — Navi Maker 3D`;
  const description = product.description.slice(0, 155);
  const imageUrl = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/producto/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product || product.status !== "ACTIVE") notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, status: "ACTIVE" },
    take: 4,
    include: { images: { take: 1, orderBy: { order: "asc" } }, category: { select: { name: true } } },
  });

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

  // Schema.org Product — ayuda a que Google muestre precio/disponibilidad en resultados
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.basePriceCents / 100).toFixed(2),
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/producto/${product.slug}`,
    },
    ...(avgRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 text-xs text-[var(--ink-soft)]">
        <Link href="/tienda">Tienda</Link> / <Link href={`/tienda?category=${product.category.slug}`}>{product.category.name}</Link> / {product.name}
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} />
        <ProductPurchasePanel product={product} />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 rounded-md border border-[var(--line)] p-6 text-sm sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="text-xs text-[var(--ink-soft)]">Material</div>
          <div className="mt-1">{product.material ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs text-[var(--ink-soft)]">Dimensiones</div>
          <div className="mt-1">{product.dimensions ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs text-[var(--ink-soft)]">Peso</div>
          <div className="mt-1">{product.weightGrams ? `${product.weightGrams} g` : "—"}</div>
        </div>
        <div>
          <div className="text-xs text-[var(--ink-soft)]">Tiempo de producción</div>
          <div className="mt-1">
            {product.estimatedProductionDays ? `${product.estimatedProductionDays} días` : "—"}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-sm font-semibold">Descripción</h2>
        <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{product.description}</p>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold">
          Reseñas {avgRating && `— ${avgRating.toFixed(1)} ★ (${product.reviews.length})`}
        </h2>
        {product.reviews.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">Todavía no hay reseñas de este producto.</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((r) => (
              <div key={r.id} className="border-b border-[var(--line)] pb-4 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  {r.user.name}
                  <span className="text-xs text-[var(--amber)]">{"★".repeat(r.rating)}</span>
                </div>
                {r.comment && <p className="mt-1 text-[var(--ink-soft)]">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-sm font-semibold">También te puede interesar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <Link key={p.id} href={`/producto/${p.slug}`} className="block">
                <div className="aspect-square overflow-hidden rounded-md border border-[var(--line)] bg-[var(--blue-tint)]">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0].url} alt={p.images[0].altText} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="mt-2 text-sm">{p.name}</div>
                <div className="text-sm font-semibold">{formatCents(p.basePriceCents)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
