import { OrdersTable } from "@/features/admin/OrdersTable";

export const metadata = { title: "Pedidos — Admin Navi Maker 3D" };

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Pedidos</h1>
      <div className="rounded-md border border-[var(--line)] bg-[var(--card)] p-5">
        <OrdersTable />
      </div>
    </div>
  );
}
