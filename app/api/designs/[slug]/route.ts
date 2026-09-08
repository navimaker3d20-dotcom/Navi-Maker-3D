import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";
import { designUpdateSchema } from "@/schemas/design.schema";
import { requireRole } from "@/lib/auth";

export const PUT = withErrorHandling(async (req, { params }: { params: { slug: string } }) => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const body = designUpdateSchema.parse(await req.json());

  const existing = await prisma.design.findUnique({ where: { slug: params.slug } });
  if (!existing) throw new ApiError("DESIGN_NOT_FOUND", "Diseño no encontrado", 404);

  const design = await prisma.design.update({
    where: { slug: params.slug },
    data: {
      ...body,
      tags: body.tagNames
        ? { set: [], connectOrCreate: body.tagNames.map((name) => ({ where: { name }, create: { name } })) }
        : undefined,
    },
    include: { tags: true },
  });

  return ok(design);
});

export const DELETE = withErrorHandling(async (_req, { params }: { params: { slug: string } }) => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  await prisma.design.delete({ where: { slug: params.slug } });
  return ok({ deleted: true });
});
