"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { formatCents } from "@/lib/format";
import { trackBeginCheckout, trackAddPaymentInfo } from "@/lib/analytics/events";
import { getGaClientId } from "@/lib/analytics/get-client-id";

export function SummaryStep({ addressId, onBack }: { addressId: string; onBack: () => void }) {
  const { items, subtotalCents, clear } = useCart();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackBeginCheckout(
      items.map((i) => ({
        item_id: i.productId,
        item_name: i.name,
        item_variant: i.variantId,
        price: i.unitPriceCents / 100,
        quantity: i.quantity,
      })),
      subtotalCents / 100
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePay() {
    setIsSubmitting(true);
    setError(null);
    try {
      // 1) Crear el pedido — el precio y el stock se validan y recalculan
      //    en el servidor (services/pricing.ts), nunca se manda un total aquí.
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId,
          notes: notes || undefined,
          gaClientId: getGaClientId(),
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.error?.message ?? "No se pudo crear el pedido");

      trackAddPaymentInfo(
        items.map((i) => ({
          item_id: i.productId,
          item_name: i.name,
          item_variant: i.variantId,
          price: i.unitPriceCents / 100,
          quantity: i.quantity,
        })),
        subtotalCents / 100
      );

      // 2) Crear la preferencia de pago en Mercado Pago para ese pedido
      const paymentRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderJson.data.id }),
      });
      const paymentJson = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(paymentJson.error?.message ?? "No se pudo iniciar el pago");

      clear();
      window.location.href = paymentJson.data.initPoint; // redirige a Mercado Pago
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error, intenta de nuevo");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-md border border-[var(--line)] p-4">
        {items.map((item) => (
          <div key={item.productId + (item.variantId ?? "")} className="flex justify-between text-sm">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span>{formatCents(item.unitPriceCents * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-[var(--line)] pt-2 text-sm font-semibold">
          <span>Subtotal (estimado)</span>
          <span>{formatCents(subtotalCents)}</span>
        </div>
        <p className="text-[11px] text-[var(--ink-soft)]">
          El envío y el total final se calculan al confirmar el pedido.
        </p>
      </div>

      <textarea
        placeholder="Notas para tu pedido (opcional): color, dedicatoria, referencias…"
        className="input w-full"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 rounded-md border border-[var(--line-strong)] py-2.5 text-sm">
          Regresar
        </button>
        <button
          onClick={handlePay}
          disabled={isSubmitting || items.length === 0}
          className="flex-1 rounded-md bg-[var(--blue)] py-2.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {isSubmitting ? "Procesando…" : "Confirmar y pagar"}
        </button>
      </div>
    </div>
  );
}
