import { prisma } from "@/lib/prisma";
import { ok, created, withErrorHandling, ApiError } from "@/lib/api-response";
import { createReviewSchema, reviewQuerySchema } from "@/schemas/review.schema";
import { requireUser } from "@/lib/auth";

export const GET = withErrorHandling(async (req) => {
  const { searchParams } = new URL(req.url);
  const query = reviewQuerySchema.parse(Object.fromEntries(searchParams));

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId: query.productId },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { user: { select: { name: true, image: true } } },
    }),
    prisma.review.count({ where: { productId: query.productId } }),
  ]);

  return ok({ items, total });
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = createReviewSchema.parse(await req.json());

  // Solo puede reseñar quien tiene al menos un pedido entregado con ese producto
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: body.productId,
      order: { userId: user.id, status: "DELIVERED" },
    },
  });

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId: body.productId, userId: user.id } },
  });
  if (existing) {
    throw new ApiError("REVIEW_ALREADY_EXISTS", "Ya reseñaste este producto", 409);
  }

  const review = await prisma.review.create({
    data: {
      productId: body.productId,
      userId: user.id,
      rating: body.rating,
      comment: body.comment,
      photoUrl: body.photoUrl,
      isVerifiedPurchase: Boolean(hasPurchased),
    },
  });

  return created(review);
});
