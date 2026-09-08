import { prisma } from "@/lib/prisma";
import { ok, created, withErrorHandling } from "@/lib/api-response";
import { productCreateSchema, productQuerySchema } from "@/schemas/product.schema";
import { requireRole } from "@/lib/auth";
import { listProducts } from "@/services/catalog";

export const GET = withErrorHandling(async (req) => {
  const { searchParams } = new URL(req.url);
  const query = productQuerySchema.parse(Object.fromEntries(searchParams));
  return ok(await listProducts(query));
});

export const POST = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const body = productCreateSchema.parse(await req.json());

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      status: body.status,
      basePriceCents: body.basePriceCents,
      compareAtPriceCents: body.compareAtPriceCents,
      currency: body.currency,
      sku: body.sku,
      stock: body.stock,
      material: body.material,
      estimatedProductionDays: body.estimatedProductionDays,
      weightGrams: body.weightGrams,
      dimensions: body.dimensions,
      categoryId: body.categoryId,
      images: { create: body.images },
      variants: { create: body.variants },
    },
    include: { images: true, variants: true },
  });

  return created(product);
});
