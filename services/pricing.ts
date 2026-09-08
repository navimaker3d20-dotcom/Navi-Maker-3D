import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import type { CreateOrderInput } from "@/schemas/order.schema";

export type PricedItem = {
  productId: string;
  variantId: string | null;
  productNameSnapshot: string;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
  availableStock: number;
};

export type OrderTotals = {
  items: PricedItem[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  couponId: string | null;
};

const FLAT_SHIPPING_CENTS = 12000; // $120 MXN — placeholder hasta integrar cotizador de envíos

// Regla de seguridad #1 de todo el proyecto: el precio y el stock del pedido
// NUNCA se toman de lo que envía el cliente. Se recalculan aquí, contra la
// base de datos, cada vez que se crea un pedido.
export async function computeOrderTotals(
  input: Pick<CreateOrderInput, "items" | "couponCode">
): Promise<OrderTotals> {
  const productIds = input.items.map((i) => i.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "ACTIVE" },
    include: { variants: true },
  });

  const productsById = new Map(products.map((p) => [p.id, p]));

  const items: PricedItem[] = input.items.map((line) => {
    const product = productsById.get(line.productId);
    if (!product) {
      throw new ApiError(
        "PRODUCT_UNAVAILABLE",
        `El producto ${line.productId} ya no está disponible`,
        409
      );
    }

    let unitPriceCents = product.basePriceCents;
    let availableStock = product.stock;

    if (line.variantId) {
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        throw new ApiError(
          "VARIANT_UNAVAILABLE",
          `La variante seleccionada de "${product.name}" ya no existe`,
          409
        );
      }
      unitPriceCents += variant.priceModifierCents;
      availableStock = variant.stockOverride ?? product.stock;
    }

    if (availableStock < line.quantity) {
      throw new ApiError(
        "INSUFFICIENT_STOCK",
        `No hay stock suficiente de "${product.name}" (disponible: ${availableStock})`,
        409
      );
    }

    return {
      productId: product.id,
      variantId: line.variantId ?? null,
      productNameSnapshot: product.name,
      unitPriceCents,
      quantity: line.quantity,
      subtotalCents: unitPriceCents * line.quantity,
      availableStock,
    };
  });

  const subtotalCents = items.reduce((sum, i) => sum + i.subtotalCents, 0);

  let discountCents = 0;
  let couponId: string | null = null;

  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.couponCode },
    });

    const now = new Date();
    const isValid =
      coupon &&
      coupon.isActive &&
      coupon.startsAt <= now &&
      coupon.expiresAt >= now &&
      (coupon.maxUses === null || coupon.usedCount < coupon.maxUses);

    if (!isValid) {
      throw new ApiError("INVALID_COUPON", "El cupón no es válido o ha expirado", 400);
    }

    couponId = coupon.id;
    discountCents =
      coupon.discountType === "PERCENTAGE"
        ? Math.round((subtotalCents * coupon.discountValue) / 100)
        : coupon.discountValue;

    discountCents = Math.min(discountCents, subtotalCents);
  }

  const shippingCents = FLAT_SHIPPING_CENTS;
  const totalCents = subtotalCents - discountCents + shippingCents;

  return { items, subtotalCents, discountCents, shippingCents, totalCents, couponId };
}
