// GA4 guarda el client_id en la cookie _ga con el formato: GA1.1.XXXXXXX.YYYYYYY
// El client_id real que espera la API son los dos últimos segmentos.
export function getGaClientId(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/_ga=([^;]+)/);
  if (!match) return null;

  const parts = match[1].split(".");
  if (parts.length < 4) return null;

  return `${parts[2]}.${parts[3]}`;
}
