import "server-only";
import { and, eq } from "drizzle-orm";
import { isStaff, type Profile } from "@/lib/auth";
import type { Db } from "@/lib/db";
import { schema } from "@/lib/db";

/** Staff must already have passed requireStaff (MFA). Clients only see their cases. */
export async function getAccessibleCase(db: Db, profile: Profile, caseId: string) {
  const [kase] = await db
    .select()
    .from(schema.cases)
    .where(
      isStaff(profile.role)
        ? eq(schema.cases.id, caseId)
        : and(eq(schema.cases.id, caseId), eq(schema.cases.clientId, profile.id)),
    )
    .limit(1);
  return kase ?? null;
}

export async function canAccessDocument(
  db: Db,
  profile: Profile,
  caseId: string,
): Promise<boolean> {
  if (isStaff(profile.role)) return true;
  const [kase] = await db
    .select({ id: schema.cases.id })
    .from(schema.cases)
    .where(and(eq(schema.cases.id, caseId), eq(schema.cases.clientId, profile.id)))
    .limit(1);
  return Boolean(kase);
}
