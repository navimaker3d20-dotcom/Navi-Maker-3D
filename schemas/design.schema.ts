import { z } from "zod";

export const designCreateSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug debe ser minúsculas y guiones"),
  description: z.string().min(10),
  imageUrl: z.string().url(),
  category: z.string().max(60).optional(),
  tagNames: z.array(z.string().min(1).max(40)).default([]),
  isPublished: z.boolean().default(true),
});

export const designUpdateSchema = designCreateSchema.partial();

export const designQuerySchema = z.object({
  tag: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(48).default(24),
});
