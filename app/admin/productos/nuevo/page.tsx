import { ProductForm } from "@/features/admin/ProductForm";

export const metadata = { title: "Nuevo producto — Admin Navi Maker 3D" };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Nuevo producto</h1>
      <ProductForm />
    </div>
  );
}
