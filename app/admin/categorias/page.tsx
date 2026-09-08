import { CategoriesManager } from "@/features/admin/CategoriesManager";

export const metadata = { title: "Categorías — Admin Navi Maker 3D" };

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Categorías</h1>
      <div className="rounded-md border border-[var(--line)] bg-[var(--card)] p-5">
        <CategoriesManager />
      </div>
    </div>
  );
}
