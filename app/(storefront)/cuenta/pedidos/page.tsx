import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";

export const metadata = { title: "Mis pedidos — Navi Maker 3D" };

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  PAYMENT_APPROVED: "Pago aprobado",
  PAYMENT_REJECTED: "Pago rechazado",
  IN_PREPARATION: "En preparación",
  IN_PRODUCTION: "En producción",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default async function PedidosPage() {
  const session = await auth();
  if (!session?.user) redirect("/cuenta/login?callbackUrl=/cuenta/pedidos");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 text-xl font-semibold">Mis pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-[var(--ink-soft)]">Todavía no has hecho ningún pedido.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-md border border-[var(--line)] p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{order.orderNumber}</span>
                <span className="text-xs text-[var(--ink-soft)]">
                  {new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(order.createdAt)}
                </span>
              </div>
              <div className="mt-1 text-[var(--ink-soft)]">
                {order.items.length} {order.items.length === 1 ? "producto" : "productos"} ·{" "}
                {formatCents(order.totalCents)}
              </div>
              <div className="mt-2 inline-block rounded bg-[var(--blue-tint)] px-2 py-0.5 text-xs text-[var(--blue-deep)]">
                {STATUS_LABEL[order.status]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
