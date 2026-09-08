import { z } from "zod";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const createPaymentSchema = z.object({
  orderId: z.string().cuid(),
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const { orderId } = createPaymentSchema.parse(await req.json());

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== user.id) {
    throw new ApiError("ORDER_NOT_FOUND", "Pedido no encontrado", 404);
  }
  if (order.status !== "PENDING_PAYMENT") {
    throw new ApiError("ORDER_NOT_PAYABLE", "Este pedido ya no admite pago", 409);
  }

  // El total viene del pedido YA verificado por services/orders.ts —
  // nunca se recibe ni se confía en un total enviado por el cliente aquí.
  const preference = await new Preference(mpClient).create({
    body: {
      external_reference: order.id,
      items: order.items.map((item) => ({
        id: item.productId,
        title: item.productNameSnapshot,
        quantity: item.quantity,
        unit_price: item.unitPriceCents / 100,
        currency_id: order.currency,
      })),
      shipments: {
        cost: order.shippingCents / 100,
        mode: "not_specified",
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmacion?order=${order.orderNumber}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmacion?order=${order.orderNumber}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=pago_rechazado`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    },
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { providerPaymentId: preference.id, status: "PENDING" },
    create: {
      orderId: order.id,
      provider: "MERCADO_PAGO",
      providerPaymentId: preference.id,
      status: "PENDING",
      amountCents: order.totalCents,
      currency: order.currency,
    },
  });

  return ok({ initPoint: preference.init_point, preferenceId: preference.id });
});
