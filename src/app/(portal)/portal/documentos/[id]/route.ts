import { get } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAuthContext, isStaff } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
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
  if (!features.blob) return new NextResponse("Not found", { status: 404 });

  const db = getDb();
  if (!db) return new NextResponse("Not found", { status: 404 });

  const [doc] = await db
    .select({
      storagePath: schema.documents.storagePath,
      name: schema.documents.name,
      caseId: schema.documents.caseId,
    })
    .from(schema.documents)
    .where(eq(schema.documents.id, id))
    .limit(1);
  if (!doc) return new NextResponse("Not found", { status: 404 });

  if (!isStaff(authCtx.profile.role)) {
    const [kase] = await db
      .select({ id: schema.cases.id })
      .from(schema.cases)
      .where(and(eq(schema.cases.id, doc.caseId), eq(schema.cases.clientId, authCtx.profile.id)))
      .limit(1);
    if (!kase) return new NextResponse("Not found", { status: 404 });
  }

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
