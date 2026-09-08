import { prisma } from "@/lib/prisma";
import { ok, created, withErrorHandling, ApiError } from "@/lib/api-response";
import { createOrderSchema } from "@/schemas/order.schema";
import { requireUser } from "@/lib/auth";
import { createOrder } from "@/services/orders";
import { checkRateLimit, orderLimiter } from "@/lib/rate-limit";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true },
  });

  return ok(orders);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();

  const { allowed } = await checkRateLimit(orderLimiter, user.id);
  if (!allowed) {
    throw new ApiError("RATE_LIMITED", "Demasiados intentos, espera un momento", 429);
  }

  const body = createOrderSchema.parse(await req.json());
  const order = await createOrder(user.id, body);

  return created(order);
});
