import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";
import { updateOrderStatusSchema } from "@/schemas/order.schema";
import { requireUser, requireRole } from "@/lib/auth";

export const GET = withErrorHandling(async (_req, { params }: { params: { id: string } }) => {
  const user = await requireUser();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, payment: true, address: true },
  });

  if (!order) throw new ApiError("ORDER_NOT_FOUND", "Pedido no encontrado", 404);

  const isOwner = order.userId === user.id;
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) {
    throw new ApiError("FORBIDDEN", "No puedes ver este pedido", 403);
  }

  return ok(order);
});

export const PATCH = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const body = updateOrderStatusSchema.parse(await req.json());

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: body.status },
  });

  // Aquí se dispararía el email transaccional correspondiente (Fase de emails)
  // según el nuevo estado: pagado, enviado, entregado, etc.

  return ok(order);
});
