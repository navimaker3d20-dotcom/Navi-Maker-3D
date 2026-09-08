import { describe, it, expect, vi, beforeEach } from "vitest";

// El servicio importa "@/lib/prisma" — lo mockeamos para no necesitar una
// base de datos real en las pruebas unitarias. Todo lo que prueba este
// archivo es la LÓGICA de precios/stock/cupón, no el acceso a datos.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: vi.fn() },
    coupon: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { computeOrderTotals } from "@/services/pricing";
import { ApiError } from "@/lib/api-response";

const baseProduct = {
  id: "prod_1",
  name: "Figura de prueba",
  basePriceCents: 10000, // $100.00
  stock: 5,
  status: "ACTIVE",
  variants: [] as any[],
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("computeOrderTotals", () => {
  it("recalcula el subtotal desde la base de datos, sin importar qué mande el cliente", async () => {
    (prisma.product.findMany as any).mockResolvedValue([baseProduct]);

    const totals = await computeOrderTotals({
      items: [{ productId: "prod_1", quantity: 2 }],
    });

    // 2 × $100.00 = $200.00, sin importar si el "cliente" hubiera mandado
    // otro precio — la función ni siquiera acepta un campo de precio en el input.
    expect(totals.subtotalCents).toBe(20000);
    expect(totals.items[0].unitPriceCents).toBe(10000);
  });

  it("lanza INSUFFICIENT_STOCK si la cantidad pedida excede el stock real", async () => {
    (prisma.product.findMany as any).mockResolvedValue([{ ...baseProduct, stock: 1 }]);

    await expect(
      computeOrderTotals({ items: [{ productId: "prod_1", quantity: 3 }] })
    ).rejects.toMatchObject({ code: "INSUFFICIENT_STOCK" } satisfies Partial<ApiError>);
  });

  it("lanza PRODUCT_UNAVAILABLE si el producto ya no existe o no está ACTIVE", async () => {
    (prisma.product.findMany as any).mockResolvedValue([]); // el where ya filtra status: ACTIVE

    await expect(
      computeOrderTotals({ items: [{ productId: "prod_fantasma", quantity: 1 }] })
    ).rejects.toMatchObject({ code: "PRODUCT_UNAVAILABLE" });
  });

  it("aplica el modificador de precio y el stockOverride de la variante seleccionada", async () => {
    const productWithVariant = {
      ...baseProduct,
      variants: [{ id: "var_1", priceModifierCents: 1500, stockOverride: 2 }],
    };
    (prisma.product.findMany as any).mockResolvedValue([productWithVariant]);

    const totals = await computeOrderTotals({
      items: [{ productId: "prod_1", variantId: "var_1", quantity: 2 }],
    });

    // $100.00 base + $15.00 de la variante = $115.00 por unidad
    expect(totals.items[0].unitPriceCents).toBe(11500);
    expect(totals.subtotalCents).toBe(23000);
  });

  it("rechaza la variante si excede el stockOverride, aunque el producto base tenga más stock", async () => {
    const productWithVariant = {
      ...baseProduct,
      stock: 100,
      variants: [{ id: "var_1", priceModifierCents: 0, stockOverride: 1 }],
    };
    (prisma.product.findMany as any).mockResolvedValue([productWithVariant]);

    await expect(
      computeOrderTotals({ items: [{ productId: "prod_1", variantId: "var_1", quantity: 2 }] })
    ).rejects.toMatchObject({ code: "INSUFFICIENT_STOCK" });
  });

  it("aplica un cupón de porcentaje válido sobre el subtotal", async () => {
    (prisma.product.findMany as any).mockResolvedValue([baseProduct]);
    (prisma.coupon.findUnique as any).mockResolvedValue({
      id: "coupon_1",
      discountType: "PERCENTAGE",
      discountValue: 10,
      isActive: true,
      startsAt: new Date(Date.now() - 86_400_000),
      expiresAt: new Date(Date.now() + 86_400_000),
      maxUses: null,
      usedCount: 0,
    });

    const totals = await computeOrderTotals({
      items: [{ productId: "prod_1", quantity: 1 }],
      couponCode: "DESCUENTO10",
    });

    expect(totals.discountCents).toBe(1000); // 10% de $100.00
    expect(totals.couponId).toBe("coupon_1");
  });

  it("rechaza un cupón expirado con INVALID_COUPON", async () => {
    (prisma.product.findMany as any).mockResolvedValue([baseProduct]);
    (prisma.coupon.findUnique as any).mockResolvedValue({
      id: "coupon_1",
      discountType: "PERCENTAGE",
      discountValue: 10,
      isActive: true,
      startsAt: new Date(Date.now() - 2 * 86_400_000),
      expiresAt: new Date(Date.now() - 86_400_000), // ya expiró
      maxUses: null,
      usedCount: 0,
    });

    await expect(
      computeOrderTotals({ items: [{ productId: "prod_1", quantity: 1 }], couponCode: "VENCIDO" })
    ).rejects.toMatchObject({ code: "INVALID_COUPON" });
  });

  it("nunca deja que el descuento supere el subtotal (evita totales negativos)", async () => {
    (prisma.product.findMany as any).mockResolvedValue([baseProduct]);
    (prisma.coupon.findUnique as any).mockResolvedValue({
      id: "coupon_1",
      discountType: "FIXED",
      discountValue: 999999, // muchísimo más que el subtotal
      isActive: true,
      startsAt: new Date(Date.now() - 86_400_000),
      expiresAt: new Date(Date.now() + 86_400_000),
      maxUses: null,
      usedCount: 0,
    });

    const totals = await computeOrderTotals({
      items: [{ productId: "prod_1", quantity: 1 }],
      couponCode: "MEGA",
    });

    expect(totals.discountCents).toBe(totals.subtotalCents);
    expect(totals.totalCents).toBeGreaterThanOrEqual(totals.shippingCents);
  });
});
