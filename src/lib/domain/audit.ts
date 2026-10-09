import "server-only";
import type { Db } from "@/lib/db";
import { schema } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function writeAudit(
  db: Db,
  entry: { actorId?: string | null; action: string; tableName: string; recordId?: string | null },
) {
  try {
    await db.insert(schema.auditLog).values({
      actorId: entry.actorId ?? null,
      action: entry.action,
      tableName: entry.tableName,
      recordId: entry.recordId ?? null,
    });
  } catch (error) {
    logger.warn("audit.write_failed", {
      action: entry.action,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
