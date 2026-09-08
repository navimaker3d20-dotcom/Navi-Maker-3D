import { gaEvent } from "@/lib/analytics/gtag";

// Forma estándar de un "item" en GA4 Ecommerce.
// price siempre en unidades de la moneda (NO en centavos) — hay que dividir
// entre 100 antes de llamar a estas funciones, ya que en toda la app los
// precios se guardan en centavos.
export type GaItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
};

const CURRENCY = "MXN";

// --- Ecommerce (GA4 Ecommerce events) ---------------------------------

export function trackViewItem(item: GaItem) {
  gaEvent("view_item", { currency: CURRENCY, value: item.price, items: [item] });
}

export function trackAddToCart(item: GaItem) {
  gaEvent("add_to_cart", {
    currency: CURRENCY,
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackRemoveFromCart(item: GaItem) {
  gaEvent("remove_from_cart", {
    currency: CURRENCY,
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackBeginCheckout(items: GaItem[], value: number) {
  gaEvent("begin_checkout", { currency: CURRENCY, value, items });
}

export function trackAddPaymentInfo(items: GaItem[], value: number, paymentType = "mercado_pago") {
  gaEvent("add_payment_info", {
    currency: CURRENCY,
    value,
    payment_type: paymentType,
    items,
  });
}

// El evento "purchase" real y confiable se dispara server-side desde el
// webhook de Mercado Pago (ver lib/analytics/measurement-protocol.ts),
// porque el navegador puede cerrarse o bloquear el tag antes de confirmar
// el pago. Esta versión client-side queda disponible por si se quiere
// duplicar en la pantalla de confirmación, pero no es la fuente de verdad.
export function trackPurchase(params: {
  transactionId: string;
  value: number;
  shipping: number;
  items: GaItem[];
}) {
  gaEvent("purchase", {
    transaction_id: params.transactionId,
    currency: CURRENCY,
    value: params.value,
    shipping: params.shipping,
    items: params.items,
  });
}

// --- Resto de eventos del brief -----------------------------------------

export function trackSearch(searchTerm: string) {
  gaEvent("search", { search_term: searchTerm });
}

export function trackSignUp(method: string = "credentials") {
  gaEvent("sign_up", { method });
}

export function trackLogin(method: string = "credentials") {
  gaEvent("login", { method });
}

export function trackViewDesign(designId: string, designName: string) {
  gaEvent("view_design", { design_id: designId, design_name: designName });
}

export function trackContact(channel: "whatsapp" | "email" | "form") {
  gaEvent("contact", { channel });
}

export function trackChatbotOpen() {
  gaEvent("chatbot_open", {});
}
