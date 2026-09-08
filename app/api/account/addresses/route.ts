import { prisma } from "@/lib/prisma";
import { ok, created, withErrorHandling } from "@/lib/api-response";
import { addressSchema } from "@/schemas/address.schema";
import { requireUser } from "@/lib/auth";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return ok(addresses);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = addressSchema.parse(await req.json());

  const address = await prisma.$transaction(async (tx) => {
    if (body.isDefault) {
      await tx.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }
    return tx.address.create({ data: { ...body, userId: user.id } });
  });

  return created(address);
});
