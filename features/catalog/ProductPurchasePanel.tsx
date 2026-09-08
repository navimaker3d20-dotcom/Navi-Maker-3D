"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { formatCents } from "@/lib/format";
import { trackViewItem } from "@/lib/analytics/events";

type Variant = {
  id: string;
  type: "COLOR" | "MATERIAL" | "SIZE" | "SCALE";
  value: string;
  priceModifierCents: number;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  basePriceCents: number;
  currency: string;
  stock: number;
  images: { url: string; altText: string }[];
  variants: Variant[];
  category: { name: string; slug: string };
};

export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const unitPriceCents = product.basePriceCents + (selectedVariant?.priceModifierCents ?? 0);

  useEffect(() => {
    trackViewItem({
      item_id: product.id,
      item_name: product.name,
      item_category: product.category.name,
      price: unitPriceCents / 100,
    });
    // Solo al montar la página del producto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const variantGroups = useMemo(() => {
    const groups = new Map<string, Variant[]>();
    for (const v of product.variants) {
      if (!groups.has(v.type)) groups.set(v.type, []);
      groups.get(v.type)!.push(v);
    }
    return groups;
  }, [product.variants]);

  async function handleAddToCart(redirectToCheckout: boolean) {
    setIsAdding(true);
    await addItem(
      {
        productId: product.id,
        variantId: selectedVariantId,
        name: product.name,
        imageUrl: product.images[0]?.url,
        unitPriceCents,
      },
      quantity
    );
    setIsAdding(false);
    if (redirectToCheckout) router.push("/carrito");
  }

  return (
    <div>
      <div className="text-xs text-[var(--ink-soft)]">{product.category.name}</div>
      <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
      <div className="mt-3 text-xl font-semibold">{formatCents(unitPriceCents, product.currency)}</div>

      {[...variantGroups.entries()].map(([type, variants]) => (
        <div key={type} className="mt-5">
          <div className="mb-2 text-xs font-medium text-[var(--ink-soft)]">{type}</div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  selectedVariantId === v.id
                    ? "border-[var(--blue)] bg-[var(--blue-tint)] text-[var(--blue-deep)]"
                    : "border-[var(--line-strong)]"
                }`}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            className="h-8 w-8 rounded border border-[var(--line-strong)]"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-6 text-center">{quantity}</span>
          <button
            className="h-8 w-8 rounded border border-[var(--line-strong)]"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
        <span className="text-xs text-[var(--ink-soft)]">
          {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
        </span>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => handleAddToCart(false)}
          disabled={isAdding || product.stock === 0}
          className="flex-1 rounded-md border border-[var(--blue)] py-2.5 text-sm font-medium text-[var(--blue-deep)] disabled:opacity-40"
        >
          Agregar al carrito
        </button>
        <button
          onClick={() => handleAddToCart(true)}
          disabled={isAdding || product.stock === 0}
          className="flex-1 rounded-md bg-[var(--blue)] py-2.5 text-sm font-medium text-white disabled:opacity-40"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  );
}
