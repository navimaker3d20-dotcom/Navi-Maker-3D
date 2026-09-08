"use client";

import { useState } from "react";
import { DesignForm } from "@/features/admin/DesignForm";
import { DesignsTable } from "@/features/admin/DesignsTable";

export default function AdminDesignsPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Diseños</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-md border border-[var(--line)] bg-[var(--card)] p-5">
          <DesignsTable reloadKey={reloadKey} />
        </div>
        <DesignForm onCreated={() => setReloadKey((k) => k + 1)} />
      </div>
    </div>
  );
}
