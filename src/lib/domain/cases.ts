import "server-only";
import { and, eq } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { schema } from "@/lib/db";
import { writeAudit } from "@/lib/domain/audit";

export async function createCaseRecord(
  db: Db,
  input: {
    actorId: string;
    clientId: string;
    title: string;
    area: string;
    reference: string | null;
  },
) {
  const [created] = await db
    .insert(schema.cases)
    .values({
      clientId: input.clientId,
      lawyerId: input.actorId,
      title: input.title,
      area: input.area,
      reference: input.reference,
    })
    .returning({ id: schema.cases.id });
  if (created) {
    await writeAudit(db, {
      actorId: input.actorId,
      action: "case.create",
      tableName: "cases",
      recordId: created.id,
    });
  }
  return created;
}

export async function addCaseEventRecord(
  db: Db,
  input: { actorId: string; caseId: string; title: string; description: string },
) {
  await db.transaction(async (tx) => {
    await tx.insert(schema.caseEvents).values({
      caseId: input.caseId,
      authorId: input.actorId,
      title: input.title,
      description: input.description,
    });
    await tx
      .update(schema.cases)
      .set({ status: "en_tramite" })
      .where(and(eq(schema.cases.id, input.caseId), eq(schema.cases.status, "abierto")));
  });
  await writeAudit(db, {
    actorId: input.actorId,
    action: "case.event.create",
    tableName: "case_events",
    recordId: input.caseId,
  });
}
