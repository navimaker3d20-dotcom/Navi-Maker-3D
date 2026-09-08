import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

const couponCreateSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(40)
    .transform((v) => v.toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().int().positive(),
  startsAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().default(1),
});

export const GET = withErrorHandling(async () => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return ok(coupons);
});

export const POST = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const body = couponCreateSchema.parse(await req.json());

  const coupon = await prisma.coupon.create({ data: body });
  return created(coupon);
});
