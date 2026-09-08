import type { ReactNode } from "react";
import { SiteHeader } from "@/features/layout/SiteHeader";
import { SiteFooter } from "@/features/layout/SiteFooter";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
