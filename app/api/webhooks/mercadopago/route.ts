import crypto from "node:crypto";
import { MercadoPagoConfig, Payment as MPPayment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { sendServerEvent } from "@/lib/analytics/measurement-protocol";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// Mapea el estado que reporta Mercado Pago al estado interno del pedido.
function mapMpStatusToOrderStatus(mpStatus: string) {
  switch (mpStatus) {
    case "approved":
      return { orderStatus: "PAYMENT_APPROVED" as const, paymentStatus: "APPROVED" as const };
    case "rejected":
      return { orderStatus: "PAYMENT_REJECTED" as const, paymentStatus: "REJECTED" as const };
    case "refunded":
    case "charged_back":
      return { orderStatus: "CANCELLED" as const, paymentStatus: "REFUNDED" as const };
    default:
      return { orderStatus: "PENDING_PAYMENT" as const, paymentStatus: "PENDING" as const };
  }
}

// Verifica la firma del webhook siguiendo el esquema de Mercado Pago:
// ts=<timestamp>,v1=<hmac-sha256 de "id:<data.id>;request-id:<x-request-id>;ts:<ts>;">
function isValidSignature(req: Request, dataId: string): boolean {
  const signatureHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!signatureHeader || !requestId || !secret) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.trim().split("=") as [string, string])
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const dataId: string | undefined = body?.data?.id;

  if (!dataId) {
    return fail("INVALID_PAYLOAD", "Payload de webhook inválido", 400);
  }

  if (!isValidSignature(req, dataId)) {
    console.warn("[mercadopago_webhook] firma inválida, se descarta el evento");
    return fail("INVALID_SIGNATURE", "Firma inválida", 401);
  }

  // La firma es válida, pero la fuente de verdad real es SIEMPRE consultar
  // el pago directamente a la API de Mercado Pago, nunca el payload del webhook.
  const mpPayment = await new MPPayment(mpClient).get({ id: dataId });

  const orderId = mpPayment.external_reference;
  if (!orderId) {
    return fail("ORDER_REFERENCE_MISSING", "El pago no trae external_reference", 400);
  }

  const { orderStatus, paymentStatus } = mapMpStatusToOrderStatus(mpPayment.status ?? "");

  const [, updatedOrder] = await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: {
        status: paymentStatus,
        providerPaymentId: String(mpPayment.id),
        rawPayload: mpPayment as unknown as object,
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus },
      include: { items: true },
    }),
  ]);

  if (orderStatus === "PAYMENT_APPROVED") {
    await sendServerEvent(updatedOrder.gaClientId, "purchase", {
      transaction_id: updatedOrder.orderNumber,
      currency: updatedOrder.currency,
      value: updatedOrder.totalCents / 100,
      shipping: updatedOrder.shippingCents / 100,
      items: updatedOrder.items.map((item) => ({
        item_id: item.productId,
        item_name: item.productNameSnapshot,
        item_variant: item.variantId ?? undefined,
        price: item.unitPriceCents / 100,
        quantity: item.quantity,
      })),
    });
  }

  // Aquí se dispararía el email de "pago aprobado" / "pago rechazado"
  // (Fase de emails transaccionales).

  return ok({ received: true });
}
