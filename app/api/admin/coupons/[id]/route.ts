import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

const patchSchema = z.object({ isActive: z.boolean() });

export const PATCH = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const { isActive } = patchSchema.parse(await req.json());

  const coupon = await prisma.coupon.update({ where: { id: params.id }, data: { isActive } });
  return ok(coupon);
});

export const DELETE = withErrorHandling(async (_req, { params }: { params: { id: string } }) => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  await prisma.coupon.delete({ where: { id: params.id } });
  return ok({ deleted: true });
});
