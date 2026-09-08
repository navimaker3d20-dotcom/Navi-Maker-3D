import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

const updateRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]),
});

export const PATCH = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  // Ascender/degradar roles es la acción más sensible del panel: solo un
  // SUPER_ADMIN puede hacerlo (un ADMIN normal ni siquiera puede promoverse
  // a sí mismo ni a otros).
  const actor = await requireRole("SUPER_ADMIN");
  const { role } = updateRoleSchema.parse(await req.json());

  if (params.id === actor.id && role !== "SUPER_ADMIN") {
    throw new ApiError("CANNOT_DEMOTE_SELF", "No puedes quitarte tu propio rol de super admin", 400);
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return ok(user);
});
