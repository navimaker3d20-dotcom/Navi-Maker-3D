import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { hashPassword } from "@/lib/password";

export const POST = withErrorHandling(async (req) => {
  const { token, password } = resetPasswordSchema.parse(await req.json());

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new ApiError("INVALID_OR_EXPIRED_TOKEN", "El enlace no es válido o ya expiró", 400);
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    // invalida cualquier otro token pendiente del mismo usuario
    prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
  ]);

  return ok({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
});
