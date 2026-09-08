import { z } from "zod";

// IMPORTANTE: este schema nunca acepta precios ni totales desde el cliente.
// Solo IDs y cantidades — el precio real se calcula en el servidor
// (ver services/pricing.ts).
export const createOrderItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.number().int().positive().max(20),
});

export const createOrderSchema = z.object({
  addressId: z.string().cuid(),
  items: z.array(createOrderItemSchema).min(1, "El carrito está vacío"),
  couponCode: z.string().min(3).max(40).optional(),
  notes: z.string().max(280).optional(),
  gaClientId: z.string().max(60).nullable().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING_PAYMENT",
    "PAYMENT_APPROVED",
    "PAYMENT_REJECTED",
    "IN_PREPARATION",
    "IN_PRODUCTION",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
