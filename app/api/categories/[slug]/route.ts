import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

const categoryUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(400).optional(),
  imageUrl: z.string().url().optional(),
});

export const PUT = withErrorHandling(async (req, { params }: { params: { slug: string } }) => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const body = categoryUpdateSchema.parse(await req.json());

  const category = await prisma.category.update({ where: { slug: params.slug }, data: body });
  return ok(category);
});

export const DELETE = withErrorHandling(async (_req, { params }: { params: { slug: string } }) => {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const productsCount = await prisma.product.count({ where: { category: { slug: params.slug } } });
  if (productsCount > 0) {
    throw new ApiError(
      "CATEGORY_HAS_PRODUCTS",
      `No puedes eliminar esta categoría: tiene ${productsCount} producto(s) asignado(s)`,
      409
    );
  }

  await prisma.category.delete({ where: { slug: params.slug } });
  return ok({ deleted: true });
});
