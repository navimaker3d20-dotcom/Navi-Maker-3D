import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";
import { changePasswordSchema } from "@/schemas/auth.schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { requireUser } from "@/lib/auth";

export const POST = withErrorHandling(async (req) => {
  const sessionUser = await requireUser();
  const { currentPassword, newPassword } = changePasswordSchema.parse(await req.json());

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user?.passwordHash) {
    throw new ApiError("NO_PASSWORD_SET", "Esta cuenta no tiene contraseña configurada", 400);
  }

  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError("INVALID_CURRENT_PASSWORD", "La contraseña actual no es correcta", 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return ok({ message: "Contraseña actualizada correctamente" });
});
