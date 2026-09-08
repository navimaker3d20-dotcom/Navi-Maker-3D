import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminArea = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminArea && !isAdminApi) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "No autorizado" } },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/cuenta/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
