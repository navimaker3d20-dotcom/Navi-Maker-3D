import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Forma consistente de toda respuesta de la API:
// éxito   -> { success: true, data }
// error   -> { success: false, error: { code, message, details? } }

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status = 400, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function fail(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status }
  );
}

// Envuelve un handler de ruta y normaliza cualquier error a una respuesta JSON
// consistente, incluyendo errores de validación de Zod.
export function withErrorHandling(
  handler: (req: Request, ctx: any) => Promise<NextResponse>
) {
  return async (req: Request, ctx: any) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.code, err.message, err.status, err.details);
      }
      if (err instanceof ZodError) {
        return fail("VALIDATION_ERROR", "Datos inválidos", 422, err.flatten());
      }
      console.error("[api_error]", err);
      return fail("INTERNAL_ERROR", "Ocurrió un error inesperado", 500);
    }
  };
}
