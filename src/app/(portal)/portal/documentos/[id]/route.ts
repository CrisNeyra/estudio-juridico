import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAuthContext } from "@/lib/auth";

/**
 * Issues a short-lived signed URL (60s) after RLS confirms the user can read the document.
 * Links are never stored or shared; each click re-checks authorization.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/portal/documentos/[id]">) {
  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) return new NextResponse("Not found", { status: 404 });

  const auth = await getAuthContext();
  if (!auth.configured || !auth.user)
    return NextResponse.redirect(new URL("/portal/login", request.url));
  if (auth.aal.next === "aal2" && auth.aal.current !== "aal2") {
    return NextResponse.redirect(new URL("/portal/mfa", request.url));
  }

  const { data: doc } = await auth.supabase
    .from("documents")
    .select("storage_path, name")
    .eq("id", id)
    .maybeSingle<{ storage_path: string; name: string }>();
  if (!doc) return new NextResponse("Not found", { status: 404 });

  const { data, error } = await auth.supabase.storage
    .from("documents")
    .createSignedUrl(doc.storage_path, 60, { download: doc.name });
  if (error || !data) return new NextResponse("Not found", { status: 404 });

  return NextResponse.redirect(data.signedUrl);
}
