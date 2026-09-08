import { create } from "zustand";
import { persist } from "zustand/middleware";

// Este store es la "vista" del carrito para renderizar la UI rápido y
// offline-friendly (invitados incluidos). NUNCA es la fuente de verdad del
// precio: al crear el pedido, el backend (services/pricing.ts, Fase 4)
// vuelve a calcular todo contra la base de datos.
export type CartLine = {
  cartItemId?: string; // solo existe una vez sincronizado con el servidor
  productId: string;
  variantId?: string;
  name: string;
  imageUrl?: string;
  unitPriceCents: number; // solo para mostrar, no se envía al crear el pedido
  quantity: number;
};

type CartState = {
  items: CartLine[];
  isSyncing: boolean;
  setSyncing: (value: boolean) => void;
  setItems: (items: CartLine[]) => void;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clear: () => void;
  subtotalCents: () => number;
  totalQuantity: () => number;
};

function sameLine(a: CartLine, productId: string, variantId?: string) {
  return a.productId === productId && a.variantId === variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      setSyncing: (value) => set({ isSyncing: value }),
      setItems: (items) => set({ items }),

      addItem: (line, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, line.productId, line.variantId));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, line.productId, line.variantId)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...line, quantity }] };
        }),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, productId, variantId) ? { ...i, quantity } : i
          ),
        })),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variantId)),
        })),

      clear: () => set({ items: [] }),

      subtotalCents: () =>
        get().items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),

      totalQuantity: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "navimaker3d-cart" } // localStorage — carrito de invitado
  )
);
