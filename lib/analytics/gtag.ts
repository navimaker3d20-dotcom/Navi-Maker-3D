export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
  }
}

export function pageview(url: string) {
  if (!GA_ID || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("config", GA_ID, { page_path: url });
}

// Todo evento pasa por aquí: se manda a gtag.js (GA4) Y se empuja al
// dataLayer. Así, cuando más adelante agregues Google Tag Manager, no hay
// que tocar ningún componente — GTM ya puede leer el mismo dataLayer.
export function gaEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });

  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}
