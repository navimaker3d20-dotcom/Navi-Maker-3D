"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatCents } from "@/lib/format";

const FLAT_SHIPPING_DISPLAY_CENTS = 12000; // solo para mostrar; el real lo calcula el server

export function CartView() {
  const { items, subtotalCents, updateQuantity, removeItem, isSyncing } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-[15px] text-[var(--ink-soft)]">Tu carrito está vacío.</p>
        <Link
          href="/tienda"
          className="mt-4 inline-block rounded-md bg-[var(--blue)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Ver tienda
        </Link>
      </div>
    );
  }

  const totalCents = subtotalCents + FLAT_SHIPPING_DISPLAY_CENTS;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId ?? "base"}`}
            className="flex items-center gap-4 rounded-md border border-[var(--line)] bg-[var(--card)] p-4"
          >
            <div className="h-16 w-16 flex-shrink-0 rounded bg-[var(--blue-tint)]" />
            <div className="flex-1">
              <div className="text-sm font-medium">{item.name}</div>
              <div className="mt-1 text-xs text-[var(--ink-soft)]">
                {formatCents(item.unitPriceCents)} c/u
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Disminuir cantidad"
                className="h-7 w-7 rounded border border-[var(--line-strong)] text-sm"
                onClick={() =>
                  updateQuantity(
                    item.productId,
                    item.variantId,
                    Math.max(1, item.quantity - 1)
                  )
                }
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                aria-label="Aumentar cantidad"
                className="h-7 w-7 rounded border border-[var(--line-strong)] text-sm"
                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="w-20 text-right text-sm font-semibold">
              {formatCents(item.unitPriceCents * item.quantity)}
            </div>
            <button
              aria-label="Eliminar producto"
              className="text-[var(--ink-soft)] hover:text-[var(--ink)]"
              onClick={() => removeItem(item.productId, item.variantId)}
            >
              ✕
            </button>
          </div>
        ))}
        {isSyncing && (
          <p className="text-xs text-[var(--ink-soft)]">Sincronizando carrito…</p>
        )}
      </div>

      <aside className="h-fit rounded-md border border-[var(--line)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">Resumen</h2>
        <div className="mt-4 space-y-2 text-sm text-[var(--ink-soft)]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[var(--ink)]">{formatCents(subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío estimado</span>
            <span className="text-[var(--ink)]">{formatCents(FLAT_SHIPPING_DISPLAY_CENTS)}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-[var(--line)] pt-4 text-sm font-semibold">
          <span>Total estimado</span>
          <span>{formatCents(totalCents)}</span>
        </div>
        <p className="mt-2 text-[11px] text-[var(--ink-soft)]">
          El total final se confirma en el checkout.
        </p>
        <Link
          href="/checkout"
          className="mt-5 block rounded-md bg-[var(--blue)] py-2.5 text-center text-sm font-medium text-white"
        >
          Proceder al pago
        </Link>
      </aside>
    </div>
  );
}
