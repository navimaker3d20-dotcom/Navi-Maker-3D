import { prisma } from "@/lib/prisma";
import { ok, created, withErrorHandling } from "@/lib/api-response";
import { designCreateSchema, designQuerySchema } from "@/schemas/design.schema";
import { requireRole } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export const GET = withErrorHandling(async (req) => {
  const { searchParams } = new URL(req.url);
  const query = designQuerySchema.parse(Object.fromEntries(searchParams));

  const where: Prisma.DesignWhereInput = {
    isPublished: true,
    ...(query.category && { category: query.category }),
    ...(query.tag && { tags: { some: { name: query.tag } } }),
  };

  const [items, total] = await Promise.all([
    prisma.design.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { tags: true },
    }),
    prisma.design.count({ where }),
  ]);

  return ok({ items, pagination: { page: query.page, pageSize: query.pageSize, total } });
});

export const POST = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const body = designCreateSchema.parse(await req.json());

  const design = await prisma.design.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      imageUrl: body.imageUrl,
      category: body.category,
      isPublished: body.isPublished,
      publishedAt: body.isPublished ? new Date() : null,
      tags: {
        connectOrCreate: body.tagNames.map((name) => ({ where: { name }, create: { name } })),
      },
    },
    include: { tags: true },
  });

  return created(design);
});
