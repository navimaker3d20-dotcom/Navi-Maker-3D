import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().max(40).optional(),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(10).max(15),
  street: z.string().min(2).max(160),
  exteriorNumber: z.string().min(1).max(20),
  interiorNumber: z.string().max(20).optional(),
  neighborhood: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(5).max(5),
  isDefault: z.boolean().default(false),
});

export const addressUpdateSchema = addressSchema.partial();
