"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore, type CartLine } from "@/store/cart-store";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics/events";

async function apiAddToCart(line: CartLine) {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: line.productId,
      variantId: line.variantId,
      quantity: line.quantity,
    }),
  });
  if (!res.ok) throw new Error("No se pudo agregar al carrito");
}

async function apiFetchCart(): Promise<CartLine[]> {
  const res = await fetch("/api/cart");
  if (!res.ok) return [];
  const { data } = await res.json();
  return data.items.map((item: any) => ({
    cartItemId: item.id,
    productId: item.productId,
    variantId: item.variantId ?? undefined,
    name: item.product.name,
    imageUrl: item.product.images?.[0]?.url,
    unitPriceCents: item.product.basePriceCents + (item.variant?.priceModifierCents ?? 0),
    quantity: item.quantity,
  }));
}

export function useCart() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const store = useCartStore();
  const hasMigrated = useRef(false);

  // Al iniciar sesión (una sola vez), sube el carrito local al servidor y
  // luego reemplaza el estado local con lo que realmente quedó en el server
  // (por si ya tenía productos guardados de una sesión anterior).
  useEffect(() => {
    if (!isAuthenticated || hasMigrated.current) return;
    hasMigrated.current = true;

    (async () => {
      store.setSyncing(true);
      try {
        const localItems = useCartStore.getState().items.filter((i) => !i.cartItemId);
        await Promise.all(localItems.map(apiAddToCart));
        const serverItems = await apiFetchCart();
        store.setItems(serverItems);
      } finally {
        store.setSyncing(false);
      }
    })();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addItem(line: Omit<CartLine, "quantity">, quantity = 1) {
    store.addItem(line, quantity);
    trackAddToCart({
      item_id: line.productId,
      item_name: line.name,
      item_variant: line.variantId,
      price: line.unitPriceCents / 100,
      quantity,
    });
    if (isAuthenticated) {
      await apiAddToCart({ ...line, quantity });
    }
  }

  async function updateQuantity(productId: string, variantId: string | undefined, quantity: number) {
    const line = store.items.find((i) => i.productId === productId && i.variantId === variantId);
    store.updateQuantity(productId, variantId, quantity);

    if (isAuthenticated && line?.cartItemId) {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId: line.cartItemId, quantity }),
      });
    }
  }

  async function removeItem(productId: string, variantId?: string) {
    const line = store.items.find((i) => i.productId === productId && i.variantId === variantId);
    store.removeItem(productId, variantId);

    if (line) {
      trackRemoveFromCart({
        item_id: line.productId,
        item_name: line.name,
        item_variant: line.variantId,
        price: line.unitPriceCents / 100,
        quantity: line.quantity,
      });
    }

    if (isAuthenticated && line?.cartItemId) {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId: line.cartItemId }),
      });
    }
  }

  return {
    items: store.items,
    isSyncing: store.isSyncing,
    subtotalCents: store.subtotalCents(),
    totalQuantity: store.totalQuantity(),
    addItem,
    updateQuantity,
    removeItem,
    clear: store.clear,
  };
}
