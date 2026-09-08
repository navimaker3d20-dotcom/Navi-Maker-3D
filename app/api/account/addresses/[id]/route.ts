import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling, ApiError } from "@/lib/api-response";
import { addressUpdateSchema } from "@/schemas/address.schema";
import { requireUser } from "@/lib/auth";

async function assertOwnership(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new ApiError("ADDRESS_NOT_FOUND", "Dirección no encontrada", 404);
  return address;
}

export const PATCH = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  await assertOwnership(user.id, params.id);
  const body = addressUpdateSchema.parse(await req.json());

  const address = await prisma.$transaction(async (tx) => {
    if (body.isDefault) {
      await tx.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }
    return tx.address.update({ where: { id: params.id }, data: body });
  });

  return ok(address);
});

export const DELETE = withErrorHandling(async (_req, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  await assertOwnership(user.id, params.id);

  await prisma.address.delete({ where: { id: params.id } });

  return ok({ deleted: true });
});
