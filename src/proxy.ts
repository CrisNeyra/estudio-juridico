import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PORTAL_PATHS = ["/portal/login", "/portal/auth/callback", "/portal/mfa"];

/**
 * Optimistic redirect for unauthenticated portal/admin routes.
 * Real authorization happens in requireUser / requireStaff.
 */
export async function proxy(request: NextRequest) {
  if (!process.env.DATABASE_URL || !process.env.AUTH_SECRET) {
    return NextResponse.next();
  }

  const session = await auth();
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PORTAL_PATHS.some((p) => pathname.startsWith(p));

  if (!session?.user && !isPublic) {
    const login = request.nextUrl.clone();
    login.pathname = "/portal/login";
    login.search = pathname === "/portal" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
