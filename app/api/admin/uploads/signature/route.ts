import { z } from "zod";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

const querySchema = z.object({
  folder: z.enum(["products", "designs"]).default("products"),
});

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const { searchParams } = new URL(req.url);
  const { folder } = querySchema.parse(Object.fromEntries(searchParams));

  const signature = generateUploadSignature(`navimaker3d/${folder}`);
  return ok(signature);
});
