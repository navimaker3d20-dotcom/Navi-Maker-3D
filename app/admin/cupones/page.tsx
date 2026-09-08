import { CouponsManager } from "@/features/admin/CouponsManager";

export const metadata = { title: "Cupones — Admin Navi Maker 3D" };

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Cupones</h1>
      <div className="rounded-md border border-[var(--line)] bg-[var(--card)] p-5">
        <CouponsManager />
      </div>
    </div>
  );
}
