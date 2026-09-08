import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function CategorySidebar({ activeSlug }: { activeSlug?: string }) {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { name: true, slug: true, _count: { select: { products: true } } },
  });

  return (
    <nav className="w-full space-y-1 md:w-48">
      <Link
        href="/tienda"
        className={`block rounded-md px-3 py-2 text-sm ${
          !activeSlug ? "bg-[var(--blue-tint)] font-medium text-[var(--blue-deep)]" : "text-[var(--ink-soft)]"
        }`}
      >
        Todas
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/tienda?category=${cat.slug}`}
          className={`flex justify-between rounded-md px-3 py-2 text-sm ${
            activeSlug === cat.slug
              ? "bg-[var(--blue-tint)] font-medium text-[var(--blue-deep)]"
              : "text-[var(--ink-soft)]"
          }`}
        >
          <span>{cat.name}</span>
          <span className="text-xs">{cat._count.products}</span>
        </Link>
      ))}
    </nav>
  );
}
