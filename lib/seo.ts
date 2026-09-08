export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://navimaker3d.com";
export const SITE_NAME = "Navi Maker 3D";

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// JSON-LD de tipo Product (Schema.org) para que Google pueda mostrar precio,
// disponibilidad y rating directo en los resultados de búsqueda.
export function productJsonLd(product: {
  name: string;
  slug: string;
  description: string;
  basePriceCents: number;
  currency: string;
  stock: number;
  images: { url: string }[];
  reviews: { rating: number }[];
}) {
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    url: absoluteUrl(`/producto/${product.slug}`),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.basePriceCents / 100).toFixed(2),
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/producto/${product.slug}`),
    },
    ...(avgRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
