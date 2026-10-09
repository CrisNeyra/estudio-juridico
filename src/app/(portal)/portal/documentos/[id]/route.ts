import { get } from "@vercel/blob";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAuthContext, isStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { canAccessDocument } from "@/lib/domain/authz";
import { getDocumentForDownload } from "@/lib/domain/documents";
import { features } from "@/lib/env";

/**
 * Streams a private Blob after server-side authorization.
 * Links are never stored publicly; each click re-checks access.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/portal/documentos/[id]">) {
  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) return new NextResponse("Not found", { status: 404 });

  const authCtx = await getAuthContext();
  if (!authCtx.configured || !authCtx.user || !authCtx.profile) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }
  if (authCtx.profile.totp_enabled && !authCtx.mfaVerified) {
    return NextResponse.redirect(new URL("/portal/mfa", request.url));
  }
  if (isStaff(authCtx.profile.role)) {
    if (!authCtx.profile.totp_enabled) {
      return NextResponse.redirect(new URL("/portal/seguridad?mfa=required", request.url));
    }
    if (!authCtx.mfaVerified) {
      return NextResponse.redirect(new URL("/portal/mfa", request.url));
    }
  }
  if (!features.blob) return new NextResponse("Not found", { status: 404 });

  const db = getDb();
  if (!db) return new NextResponse("Not found", { status: 404 });

  const doc = await getDocumentForDownload(db, id);
  if (!doc) return new NextResponse("Not found", { status: 404 });

  const allowed = await canAccessDocument(db, authCtx.profile, doc.caseId);
  if (!allowed) return new NextResponse("Not found", { status: 404 });

  const result = await get(doc.storagePath, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${doc.name.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
