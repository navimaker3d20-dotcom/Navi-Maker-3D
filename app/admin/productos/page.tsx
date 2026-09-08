import Link from "next/link";
import { ProductsTable } from "@/features/admin/ProductsTable";

export const metadata = { title: "Productos — Admin Navi Maker 3D" };

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-md bg-[var(--blue)] px-4 py-2 text-sm font-medium text-white"
        >
          + Nuevo producto
        </Link>
      </div>
      <div className="rounded-md border border-[var(--line)] bg-[var(--card)] p-5">
        <ProductsTable />
      </div>
    </div>
  );
}
