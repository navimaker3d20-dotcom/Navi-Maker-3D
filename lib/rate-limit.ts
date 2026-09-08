import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Si no hay credenciales de Upstash configuradas (ej. en desarrollo local),
// el rate limiter queda deshabilitado en vez de tumbar la app.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function buildLimiter(requests: number, window: `${number} ${"s" | "m" | "h"}`) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
  });
}

// Límites por tipo de endpoint
export const authLimiter = buildLimiter(10, "1 m"); // login/registro/recuperar
export const orderLimiter = buildLimiter(20, "1 m"); // creación de pedidos
export const chatLimiter = buildLimiter(30, "1 m"); // chatbot

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ allowed: boolean; remaining?: number }> {
  if (!limiter) return { allowed: true }; // sin Redis configurado -> no bloquea
  const { success, remaining } = await limiter.limit(identifier);
  return { allowed: success, remaining };
}

// Identificador razonable cuando no hay usuario autenticado: IP del request
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() ?? "unknown";
}
