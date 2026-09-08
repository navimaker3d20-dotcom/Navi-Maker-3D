import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DesignCard } from "@/features/catalog/DesignCard";

export const metadata: Metadata = {
  title: "Diseños — Navi Maker 3D",
  description: "Portafolio de diseños 3D: anime, gaming, articulados, decoración y personalizados.",
};

const CATEGORIES = ["Anime", "Gaming", "Articulados", "Decoración", "Personalizados"];

export default async function DisenosPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const designs = await prisma.design.findMany({
    where: { isPublished: true, ...(searchParams.category && { category: searchParams.category }) },
    orderBy: { publishedAt: "desc" },
    take: 24,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Diseños</h1>
      <p className="mb-6 text-sm text-[var(--ink-soft)]">Piezas que hemos diseñado e impreso en el taller.</p>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/disenos"
          className={`rounded-full border px-3 py-1 text-xs ${
            !searchParams.category ? "border-[var(--blue)] text-[var(--blue-deep)]" : "border-[var(--line-strong)]"
          }`}
        >
          Todos
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/disenos?category=${encodeURIComponent(c)}`}
            className={`rounded-full border px-3 py-1 text-xs ${
              searchParams.category === c ? "border-[var(--blue)] text-[var(--blue-deep)]" : "border-[var(--line-strong)]"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {designs.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--ink-soft)]">
          Todavía no hay diseños publicados en esta categoría.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {designs.map((d) => (
            <DesignCard key={d.id} design={d} />
          ))}
        </div>
      )}
    </div>
  );
}
