import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, authLimiter, getClientIp } from "@/lib/rate-limit";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export const POST = withErrorHandling(async (req) => {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(authLimiter, ip);
  if (!allowed) {
    throw new ApiError("RATE_LIMITED", "Demasiados intentos, espera un momento", 429);
  }

  const { email } = forgotPasswordSchema.parse(await req.json());

  const user = await prisma.user.findUnique({ where: { email } });

  // Respuesta idéntica exista o no el usuario: evita que alguien use este
  // endpoint para averiguar qué emails están registrados.
  const genericResponse = ok({
    message: "Si el correo existe, enviamos instrucciones para recuperar tu contraseña.",
  });

  if (!user) return genericResponse;

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    }),
  ]);

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cuenta/restablecer-contrasena?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  return genericResponse;
});
