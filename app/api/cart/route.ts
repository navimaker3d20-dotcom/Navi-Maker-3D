import { prisma } from "@/lib/prisma";
import { ok, created, withErrorHandling, ApiError } from "@/lib/api-response";
import { addToCartSchema, updateCartItemSchema, removeCartItemSchema } from "@/schemas/cart.schema";
import { requireUser } from "@/lib/auth";

// El carrito de invitados vive en localStorage en el cliente (ver Fase 1).
// Este endpoint solo maneja el carrito persistente de usuarios autenticados;
// la migración de carrito local -> servidor ocurre al iniciar sesión (Fase 5).

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1, orderBy: { order: "asc" } } } },
          variant: true,
        },
      },
    },
  });
}

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const cart = await getOrCreateCart(user.id);
  return ok(cart);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = addToCartSchema.parse(await req.json());

  const cart = await getOrCreateCart(user.id);

const existingItem = await prisma.cartItem.findFirst({
  where: {
    cartId: cart.id,
    productId: body.productId,
    variantId: body.variantId ?? null,
  },
});

let item;

if (existingItem) {
  item = await prisma.cartItem.update({
    where: { id: existingItem.id },
    data: {
      quantity: { increment: body.quantity },
    },
  });
} else {
  item = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: body.productId,
      variantId: body.variantId ?? null,
      quantity: body.quantity,
    },
  });
}
  return created(item);
});

export const PATCH = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = updateCartItemSchema.parse(await req.json());

  const item = await prisma.cartItem.findFirst({
    where: { id: body.cartItemId, cart: { userId: user.id } },
  });
  if (!item) throw new ApiError("CART_ITEM_NOT_FOUND", "El producto no está en tu carrito", 404);

  const updated = await prisma.cartItem.update({
    where: { id: body.cartItemId },
    data: { quantity: body.quantity },
  });

  return ok(updated);
});

export const DELETE = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = removeCartItemSchema.parse(await req.json());

  await prisma.cartItem.deleteMany({
    where: { id: body.cartItemId, cart: { userId: user.id } },
  });

  return ok({ deleted: true });
});
