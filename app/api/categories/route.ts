import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

const categoryCreateSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().max(400).optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().cuid().optional(),
});

export const GET = withErrorHandling(async () => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return ok(categories);
});

export const POST = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const body = categoryCreateSchema.parse(await req.json());

  const category = await prisma.category.create({ data: body });
  return created(category);
});
