import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Imágenes placeholder genéricas (no son fotos reales de producto ni de
// ninguna IP protegida) — solo para poder ver el catálogo funcionando
// mientras se suben fotos reales de las piezas impresas.
const placeholderImage = (seed: string) => `https://placehold.co/800x800/EAEFFF/2657FF?text=${seed}`;

async function main() {
  console.log("Sembrando base de datos de Navi Maker 3D…");

  // --- Usuarios -----------------------------------------------------
  const superAdminPassword = await bcrypt.hash("CambiaEstaPassword123", 12);
  const adminPassword = await bcrypt.hash("CambiaEstaPassword123", 12);
  const customerPassword = await bcrypt.hash("ClientePrueba123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@navimaker3d.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@navimaker3d.com",
      passwordHash: superAdminPassword,
      role: "SUPER_ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@navimaker3d.com" },
    update: {},
    create: {
      name: "Admin Navi Maker",
      email: "admin@navimaker3d.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "cliente@ejemplo.com" },
    update: {},
    create: {
      name: "Cliente de Prueba",
      email: "cliente@ejemplo.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      phone: "5512345678",
      cart: { create: {} },
      addresses: {
        create: {
          label: "Casa",
          fullName: "Cliente de Prueba",
          phone: "5512345678",
          street: "Av. Insurgentes Sur",
          exteriorNumber: "1234",
          neighborhood: "Del Valle",
          city: "Ciudad de México",
          state: "CDMX",
          postalCode: "03100",
          isDefault: true,
        },
      },
    },
  });

  // --- Categorías -----------------------------------------------------
  const categoryData = [
    { name: "Anime", slug: "anime" },
    { name: "Articuladas", slug: "articuladas" },
    { name: "Llaveros", slug: "llaveros" },
    { name: "Decoración", slug: "decoracion" },
    { name: "Personalizados", slug: "personalizados" },
  ];

  const categories = new Map<string, string>();
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.set(cat.slug, created.id);
  }

  // --- Productos --------------------------------------------------------
  const products = [
    {
      name: "Figura de guerrero anime",
      slug: "figura-guerrero-anime",
      description:
        "Figura articulada de 18cm inspirada en un guerrero anime clásico, impresa en PLA y pintada a mano.",
      basePriceCents: 68000,
      sku: "NM3D-ANI-001",
      stock: 12,
      material: "PLA",
      estimatedProductionDays: 5,
      categorySlug: "anime",
    },
    {
      name: "Ninja articulado escala 1:8",
      slug: "ninja-articulado-1-8",
      description: "Figura completamente articulada de un ninja, escala 1:8, ideal para posar y coleccionar.",
      basePriceCents: 89000,
      compareAtPriceCents: 99000,
      sku: "NM3D-ART-001",
      stock: 8,
      material: "PLA + articulaciones PETG",
      estimatedProductionDays: 7,
      categorySlug: "articuladas",
    },
    {
      name: "Pirata explorador de escritorio",
      slug: "pirata-explorador-escritorio",
      description: "Figura decorativa de un capitán pirata explorador, perfecta para escritorio o repisa.",
      basePriceCents: 52000,
      sku: "NM3D-DEC-001",
      stock: 15,
      material: "PLA",
      estimatedProductionDays: 4,
      categorySlug: "decoracion",
    },
    {
      name: "Set 3 llaveros gremio anime",
      slug: "set-3-llaveros-gremio-anime",
      description: "Set de 3 llaveros con símbolos de gremios anime, ideales para regalo.",
      basePriceCents: 21000,
      sku: "NM3D-LLA-001",
      stock: 30,
      material: "PLA",
      estimatedProductionDays: 2,
      categorySlug: "llaveros",
    },
    {
      name: "Retrato en figura a pedido",
      slug: "retrato-figura-a-pedido",
      description:
        "Convertimos tu idea, personaje o retrato en una figura 3D personalizada. El precio final depende de la complejidad.",
      basePriceCents: 95000,
      sku: "NM3D-PER-001",
      stock: 999,
      material: "A definir según diseño",
      estimatedProductionDays: 10,
      categorySlug: "personalizados",
    },
  ];

  for (const p of products) {
    const { categorySlug, ...data } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...data,
        status: "ACTIVE",
        categoryId: categories.get(categorySlug)!,
        images: {
          create: [{ url: placeholderImage(p.slug), altText: p.name, order: 0 }],
        },
      },
    });
  }

  // --- Cupón de ejemplo ---------------------------------------------------
  await prisma.coupon.upsert({
    where: { code: "BIENVENIDA10" },
    update: {},
    create: {
      code: "BIENVENIDA10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
      maxUsesPerUser: 1,
    },
  });

  console.log("Seed completo:");
  console.log(`- Super admin: superadmin@navimaker3d.com / CambiaEstaPassword123`);
  console.log(`- Admin: admin@navimaker3d.com / CambiaEstaPassword123`);
  console.log(`- Cliente de prueba: cliente@ejemplo.com / ClientePrueba123`);
  console.log(`- ${categoryData.length} categorías, ${products.length} productos, 1 cupón (BIENVENIDA10)`);
  console.log("IMPORTANTE: cambia estas contraseñas antes de ir a producción.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
