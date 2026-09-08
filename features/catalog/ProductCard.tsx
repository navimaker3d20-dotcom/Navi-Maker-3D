import Link from "next/link";
import { formatCents } from "@/lib/format";

type ProductCardData = {
  slug: string;
  name: string;
  basePriceCents: number;
  compareAtPriceCents?: number | null;
  images: { url: string; altText: string }[];
  category: { name: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const hasDiscount = !!product.compareAtPriceCents && product.compareAtPriceCents > product.basePriceCents;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="block overflow-hidden rounded-md border border-[var(--line)] bg-[var(--card)]"
    >
      <div className="relative aspect-square border-b border-[var(--line)] bg-[var(--blue-tint)]">
        {product.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0].url}
            alt={product.images[0].altText}
            className="h-full w-full object-cover"
          />
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded bg-[var(--amber-tint)] px-2 py-0.5 text-[11px] text-[#7A4B0F]">
            Oferta
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="mb-1 text-[11px] text-[var(--ink-soft)]">{product.category.name}</div>
        <div className="mb-2 text-sm font-medium">{product.name}</div>
        <div className="text-sm font-semibold">
          {hasDiscount && (
            <span className="mr-1.5 text-xs font-normal text-[var(--ink-soft)] line-through">
              {formatCents(product.compareAtPriceCents!)}
            </span>
          )}
          {formatCents(product.basePriceCents)}
        </div>
      </div>
    </Link>
  );
}
