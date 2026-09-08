import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 30), 100);

  const where = status ? { status: status as never } : {};

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } },
        payment: { select: { status: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return ok({ items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});
