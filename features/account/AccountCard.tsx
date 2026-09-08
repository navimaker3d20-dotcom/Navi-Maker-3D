import type { ReactNode } from "react";

export function AccountCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-xl font-semibold">{title}</h1>
      {children}
    </div>
  );
}
