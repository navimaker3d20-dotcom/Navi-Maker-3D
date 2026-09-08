import { auth } from "@/auth"; // config completa de Auth.js -> se construye en Fase 5
import { ApiError } from "@/lib/api-response";
import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  role: Role;
  email: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

// Lanza ApiError si no hay usuario autenticado
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError("UNAUTHENTICATED", "Necesitas iniciar sesión", 401);
  }
  return user;
}

// Lanza ApiError si el usuario no tiene uno de los roles permitidos
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ApiError("FORBIDDEN", "No tienes permiso para esta acción", 403);
  }
  return user;
}
