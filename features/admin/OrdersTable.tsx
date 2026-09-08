"use client";

import { useEffect, useState } from "react";
import { formatCents } from "@/lib/format";

type AdminOrder = {
  id: string;
  orderNumber: string;
  totalCents: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  payment: { status: string } | null;
};

const STATUS_OPTIONS = [
  "PENDING_PAYMENT",
  "PAYMENT_APPROVED",
  "PAYMENT_REJECTED",
  "IN_PREPARATION",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

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

export function OrdersTable() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders?pageSize=50")
      .then((r) => r.json())
      .then(({ data }) => setOrders(data.items))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: string, status: string) {
    setSavingId(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
    setSavingId(null);
  }

  if (loading) return <p className="text-sm text-[var(--ink-soft)]">Cargando pedidos…</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-[var(--ink-soft)]">
          <th className="pb-2">Pedido</th>
          <th className="pb-2">Cliente</th>
          <th className="pb-2">Total</th>
          <th className="pb-2">Pago</th>
          <th className="pb-2">Estado</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id} className="border-t border-[var(--line)]">
            <td className="py-2 font-medium">{order.orderNumber}</td>
            <td className="py-2 text-[var(--ink-soft)]">
              {order.user.name}
              <div className="text-xs">{order.user.email}</div>
            </td>
            <td className="py-2">{formatCents(order.totalCents)}</td>
            <td className="py-2 text-xs text-[var(--ink-soft)]">{order.payment?.status ?? "—"}</td>
            <td className="py-2">
              <select
                value={order.status}
                disabled={savingId === order.id}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="rounded border border-[var(--line-strong)] px-2 py-1 text-xs"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
        {orders.length === 0 && (
          <tr>
            <td colSpan={5} className="py-8 text-center text-[var(--ink-soft)]">
              Todavía no hay pedidos.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
