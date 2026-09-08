import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 30), 100);

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return ok({ items, pagination: { page, pageSize, total } });
});
