import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

// A diferencia de /api/products (público, solo status ACTIVE), este endpoint
// es exclusivo del panel admin y regresa productos en cualquier estado
// (DRAFT/ACTIVE/ARCHIVED) para poder administrarlos.
export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 30), 100);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        category: { select: { name: true } },
      },
    }),
    prisma.product.count(),
  ]);

  return ok({ items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});
