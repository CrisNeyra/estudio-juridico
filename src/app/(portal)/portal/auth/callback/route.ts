import { NextResponse } from "next/server";

/** Auth.js handles the callback at /api/auth/callback/* — keep this for old links. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/portal";
  return NextResponse.redirect(new URL(`/portal/login?next=${encodeURIComponent(next)}`, url));
}
