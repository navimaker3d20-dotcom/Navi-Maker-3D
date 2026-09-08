import { z } from "zod";

export const productVariantInputSchema = z.object({
  type: z.enum(["COLOR", "MATERIAL", "SIZE", "SCALE"]),
  value: z.string().min(1).max(60),
  priceModifierCents: z.number().int().default(0),
  stockOverride: z.number().int().nonnegative().optional(),
  sku: z.string().min(1).max(60).optional(),
});

export const productImageInputSchema = z.object({
  url: z.string().url(),
  altText: z.string().min(1).max(140),
  order: z.number().int().nonnegative().default(0),
});

export const productCreateSchema = z.object({
  name: z.string().min(2).max(140),
  slug: z
    .string()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug debe ser minúsculas y guiones, sin espacios"),
  description: z.string().min(10),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  basePriceCents: z.number().int().positive(),
  compareAtPriceCents: z.number().int().positive().optional(),
  currency: z.string().length(3).default("MXN"),
  sku: z.string().min(2).max(60),
  stock: z.number().int().nonnegative().default(0),
  material: z.string().max(80).optional(),
  estimatedProductionDays: z.number().int().positive().optional(),
  weightGrams: z.number().int().positive().optional(),
  dimensions: z.string().max(60).optional(),
  categoryId: z.string().cuid(),
  images: z.array(productImageInputSchema).min(1, "Sube al menos una imagen"),
  variants: z.array(productVariantInputSchema).default([]),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().max(100).optional(),
  category: z.string().optional(), // slug de categoría
  minPriceCents: z.coerce.number().int().nonnegative().optional(),
  maxPriceCents: z.coerce.number().int().positive().optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "popular"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(48).default(24),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
