import { z } from "zod";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import { checkRateLimit, chatLimiter, getClientIp } from "@/lib/rate-limit";

// La API key NUNCA se expone al frontend: este endpoint es el único lugar
// donde se usa. El chatbot en el cliente solo llama a /api/chat.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  // historial corto para dar contexto de la conversación, sin guardarlo en BD todavía
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(10)
    .optional(),
});

const FALLBACK_MESSAGE = "Un asesor puede ayudarte con esto. ¿Quieres que te conecte por WhatsApp?";

const SYSTEM_PROMPT = `
Eres el asistente de atención al cliente de Navi Maker 3D, una tienda mexicana
de figuras impresas en 3D (anime, articuladas, llaveros, personalizados).
Responde en español, de forma breve y concreta.
Solo puedes hablar de: productos y precios (usa el CONTEXTO de productos que
se te da), materiales, tiempos de producción, personalizados, métodos de pago
y envío. Si no tienes la información o la pregunta se sale de esos temas,
responde exactamente: "${FALLBACK_MESSAGE}"
No inventes precios, stock ni tiempos que no estén en el CONTEXTO.
`.trim();

// Búsqueda simple de productos relevantes para dar contexto real al modelo,
// en vez de dejar que "alucine" precios o disponibilidad.
async function getRelevantProductsContext(message: string) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: message, mode: "insensitive" } },
        { category: { name: { contains: message, mode: "insensitive" } } },
      ],
    },
    take: 5,
    select: {
      name: true,
      basePriceCents: true,
      currency: true,
      material: true,
      estimatedProductionDays: true,
      stock: true,
    },
  });

  if (products.length === 0) return "Sin productos específicos que coincidan con la consulta.";

  return products
    .map(
      (p) =>
        `- ${p.name}: $${(p.basePriceCents / 100).toFixed(2)} ${p.currency}, material ${p.material ?? "no especificado"}, tiempo de producción ${p.estimatedProductionDays ?? "no especificado"} días, stock ${p.stock}`
    )
    .join("\n");
}

export const POST = withErrorHandling(async (req) => {
  const ip = getClientIp(req);
  const { allowed } = await checkRateLimit(chatLimiter, ip);
  if (!allowed) {
    return ok({ reply: "Estás enviando mensajes muy rápido, espera un momento.", escalate: false });
  }

  const { message, history } = chatSchema.parse(await req.json());
  const productContext = await getRelevantProductsContext(message);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: `CONTEXTO de productos:\n${productContext}` },
      ...(history ?? []),
      { role: "user", content: message },
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  const reply = completion.choices[0]?.message?.content?.trim() ?? FALLBACK_MESSAGE;
  const escalate = reply === FALLBACK_MESSAGE;

  return ok({ reply, escalate });
});
