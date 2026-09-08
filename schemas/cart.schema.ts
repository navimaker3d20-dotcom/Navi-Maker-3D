import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.number().int().positive().max(20).default(1),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().cuid(),
  quantity: z.number().int().positive().max(20),
});

export const removeCartItemSchema = z.object({
  cartItemId: z.string().cuid(),
});
