import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export const GET = withErrorHandling(async () => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const designs = await prisma.design.findMany({
    orderBy: { createdAt: "desc" },
    include: { tags: true },
  });
  return ok(designs);
});
