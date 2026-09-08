import Link from "next/link";
import { getDashboardMetrics } from "@/services/admin-metrics";
import { MetricCard } from "@/features/admin/MetricCard";
import { formatCents } from "@/lib/format";

export const metadata = { title: "Dashboard — Admin Navi Maker 3D" };

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

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Ventas totales" value={formatCents(metrics.totalRevenueCents)} />
        <MetricCard label="Pedidos pagados" value={String(metrics.paidOrdersCount)} />
        <MetricCard label="Pedidos pendientes" value={String(metrics.pendingOrdersCount)} />
        <MetricCard label="Ticket promedio" value={formatCents(metrics.averageTicketCents)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-md border border-[var(--line)] bg-[var(--card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pedidos recientes</h2>
            <Link href="/admin/pedidos" className="text-xs text-[var(--blue-deep)]">
              Ver todos
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--ink-soft)]">
                <th className="pb-2">Pedido</th>
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-[var(--line)]">
                  <td className="py-2 font-medium">{order.orderNumber}</td>
                  <td className="py-2 text-[var(--ink-soft)]">{order.user.name}</td>
                  <td className="py-2">{formatCents(order.totalCents)}</td>
                  <td className="py-2 text-[var(--ink-soft)]">{STATUS_LABEL[order.status]}</td>
                </tr>
              ))}
              {metrics.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[var(--ink-soft)]">
                    Todavía no hay pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-md border border-[var(--line)] bg-[var(--card)] p-5">
          <h2 className="mb-4 text-sm font-semibold">Más vendidos</h2>
          <ul className="space-y-3">
            {metrics.topProducts.map((p) => (
              <li key={p.productId} className="flex justify-between text-sm">
                <span className="truncate pr-2">{p.name}</span>
                <span className="text-[var(--ink-soft)]">{p.unitsSold} u.</span>
              </li>
            ))}
            {metrics.topProducts.length === 0 && (
              <li className="text-sm text-[var(--ink-soft)]">Sin ventas registradas aún.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
