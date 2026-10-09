import "server-only";
import { del, put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { schema } from "@/lib/db";
import { env } from "@/lib/env";
import { writeAudit } from "@/lib/domain/audit";
import { ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_BYTES, sanitizeFileName } from "@/lib/portal";

export async function uploadCaseDocument(
  db: Db,
  input: { actorId: string; caseId: string; file: File },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { file, caseId, actorId } = input;
  if (file.size === 0) return { ok: false, message: "Elegí un archivo." };
  if (file.size > MAX_DOCUMENT_BYTES) return { ok: false, message: "El archivo supera los 20 MB." };
  if (!(ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, message: "Formato no permitido. Usá PDF, imágenes o Word." };
  }

  const path = `cases/${caseId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const token = env.BLOB_READ_WRITE_TOKEN;
  const blob = await put(path, file, {
    access: "private",
    contentType: file.type,
    token,
  });

  try {
    await db.insert(schema.documents).values({
      caseId,
      uploadedBy: actorId,
      name: sanitizeFileName(file.name),
      storagePath: blob.url,
      sizeBytes: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    try {
      await del(blob.url, { token });
    } catch {
      /* ignore */
    }
    throw error;
  }

  await writeAudit(db, {
    actorId,
    action: "document.upload",
    tableName: "documents",
    recordId: caseId,
  });
  return { ok: true };
}

export async function getDocumentForDownload(db: Db, id: string) {
  const [doc] = await db
    .select({
      storagePath: schema.documents.storagePath,
      name: schema.documents.name,
      caseId: schema.documents.caseId,
    })
    .from(schema.documents)
    .where(eq(schema.documents.id, id))
    .limit(1);
  return doc ?? null;
}
