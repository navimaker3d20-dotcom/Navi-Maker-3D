import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const PAID_STATUSES: Prisma.OrderStatus[] = [
  "PAYMENT_APPROVED",
  "IN_PREPARATION",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
];

export async function getDashboardMetrics() {
  const [
    revenueAgg,
    paidOrdersCount,
    pendingOrdersCount,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: {
          in: PAID_STATUSES,
        },
      },
      _sum: {
        totalCents: true,
      },
    }),

    prisma.order.count({
      where: {
        status: {
          in: PAID_STATUSES,
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "PENDING_PAYMENT",
      },
    }),

    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        totalCents: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),

    prisma.orderItem.groupBy({
      by: ["productId", "productNameSnapshot"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    }),
  ]);

  const totalRevenueCents = revenueAgg._sum.totalCents ?? 0;

  const averageTicketCents =
    paidOrdersCount > 0
      ? Math.round(totalRevenueCents / paidOrdersCount)
      : 0;

  return {
    totalRevenueCents,
    paidOrdersCount,
    pendingOrdersCount,
    averageTicketCents,
    recentOrders,

    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      name: p.productNameSnapshot,
      unitsSold: p._sum.quantity ?? 0,
    })),
  };
}