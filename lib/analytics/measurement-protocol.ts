import { GA_ID } from "@/lib/analytics/gtag";

const GA_API_SECRET = process.env.GA_API_SECRET;

// Se usa desde el webhook de Mercado Pago para registrar "purchase" de forma
// confiable: el navegador del cliente ya no está garantizado a esa altura
// (pudo cerrar la pestaña, tener un bloqueador de anuncios, etc.), así que
// el evento se manda directo desde el servidor a la API de GA4.
export async function sendServerEvent(
  clientId: string | null | undefined,
  name: string,
  params: Record<string, unknown>
) {
  if (!GA_ID || !GA_API_SECRET || !clientId) {
    console.warn("[ga_measurement_protocol] evento omitido: falta GA_ID, API secret o client_id");
    return;
  }

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          events: [{ name, params }],
        }),
      }
    );
  } catch (err) {
    console.error("[ga_measurement_protocol_failed]", err);
  }
}
