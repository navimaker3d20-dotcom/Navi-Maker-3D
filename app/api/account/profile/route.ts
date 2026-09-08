import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import { updateProfileSchema } from "@/schemas/auth.schema";
import { requireUser } from "@/lib/auth";

export const GET = withErrorHandling(async () => {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, addresses: true, wishlist: true } },
    },
  });

  return ok(user);
});

export const PATCH = withErrorHandling(async (req) => {
  const sessionUser = await requireUser();
  const body = updateProfileSchema.parse(await req.json());

  const user = await prisma.user.update({
    where: { id: sessionUser.id },
    data: body,
    select: { id: true, name: true, email: true, phone: true, image: true },
  });

  return ok(user);
});
