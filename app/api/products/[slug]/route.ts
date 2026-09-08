import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";
import { productUpdateSchema } from "@/schemas/product.schema";
import { requireRole } from "@/lib/auth";
import { getProductBySlug } from "@/services/catalog";

export const GET = withErrorHandling(async (_req, { params }: { params: { slug: string } }) => {
  const result = await getProductBySlug(params.slug);
  if (!result) throw new ApiError("PRODUCT_NOT_FOUND", "Producto no encontrado", 404);
  return ok(result);
});

export const PUT = withErrorHandling(async (req, { params }: { params: { slug: string } }) => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const body = productUpdateSchema.parse(await req.json());

  const product = await prisma.product.update({
    where: { slug: params.slug },
    data: {
      ...body,
      images: body.images ? { deleteMany: {}, create: body.images } : undefined,
      variants: body.variants ? { deleteMany: {}, create: body.variants } : undefined,
    },
    include: { images: true, variants: true },
  });

  return ok(product);
});

export const DELETE = withErrorHandling(async (_req, { params }: { params: { slug: string } }) => {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const product = await prisma.product.update({
    where: { slug: params.slug },
    data: { status: "ARCHIVED" },
  });

  return ok(product);
});
