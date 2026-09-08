import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(600).optional(),
  photoUrl: z.string().url().optional(),
});

export const reviewQuerySchema = z.object({
  productId: z.string().cuid(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});
