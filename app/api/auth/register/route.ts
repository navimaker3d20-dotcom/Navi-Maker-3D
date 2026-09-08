import { prisma } from "@/lib/prisma";
import { created, withErrorHandling, ApiError } from "@/lib/api-response";
import { registerSchema } from "@/schemas/auth.schema";
import { hashPassword } from "@/lib/password";
import { sendWelcomeEmail } from "@/lib/email";
import { checkRateLimit, authLimiter, getClientIp } from "@/lib/rate-limit";

export const POST = withErrorHandling(async (req) => {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(authLimiter, ip);
  if (!allowed) {
    throw new ApiError("RATE_LIMITED", "Demasiados intentos, espera un momento", 429);
  }

  const body = registerSchema.parse(await req.json());

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    // Mensaje genérico a propósito: no confirmamos si el email ya existe
    // en detalle para no facilitar enumeración de cuentas.
    throw new ApiError("REGISTRATION_FAILED", "No pudimos crear la cuenta con estos datos", 409);
  }

  const passwordHash = await hashPassword(body.password);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      phone: body.phone,
      role: "CUSTOMER",
      cart: { create: {} },
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // El email no debe tumbar el registro si el proveedor falla
  sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error("[welcome_email_failed]", err)
  );

  return created(user);
});
