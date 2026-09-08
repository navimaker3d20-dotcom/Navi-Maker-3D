import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import { computeOrderTotals } from "@/services/pricing";
import type { CreateOrderInput } from "@/schemas/order.schema";

async function nextOrderNumber(tx: typeof prisma): Promise<string> {
  const count = await tx.order.count();
  return `NM3D-${String(count + 1).padStart(6, "0")}`;
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  const address = await prisma.address.findFirst({
    where: { id: input.addressId, userId },
  });
  if (!address) {
    throw new ApiError("ADDRESS_NOT_FOUND", "La dirección no pertenece a este usuario", 404);
  }

  const totals = await computeOrderTotals(input);

  // Transacción: recalcular, descontar stock y crear el pedido deben
  // suceder juntos o no suceder — evita condiciones de carrera de stock.
  const order = await prisma.$transaction(async (tx) => {
    for (const item of totals.items) {
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant?.stockOverride !== null && variant?.stockOverride !== undefined) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockOverride: { decrement: item.quantity } },
          });
          continue;
        }
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const orderNumber = await nextOrderNumber(tx as typeof prisma);

    const created = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: input.addressId,
        status: "PENDING_PAYMENT",
        subtotalCents: totals.subtotalCents,
        shippingCents: totals.shippingCents,
        discountCents: totals.discountCents,
        totalCents: totals.totalCents,
        couponId: totals.couponId,
        notes: input.notes,
        gaClientId: input.gaClientId ?? null,
        items: {
          create: totals.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            productNameSnapshot: i.productNameSnapshot,
            unitPriceCents: i.unitPriceCents,
            quantity: i.quantity,
            subtotalCents: i.subtotalCents,
          })),
        },
      },
      include: { items: true },
    });

    if (totals.couponId) {
      await tx.coupon.update({
        where: { id: totals.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Vacía el carrito del usuario tras crear el pedido
    await tx.cartItem.deleteMany({ where: { cart: { userId } } });

    return created;
  });

  return order;
}
