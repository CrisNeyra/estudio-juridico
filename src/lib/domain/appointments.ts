import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { schema } from "@/lib/db";
import { writeAudit } from "@/lib/domain/audit";

export async function findProfileIdByEmail(db: Db, email: string): Promise<string | null> {
  const [row] = await db
    .select({ id: schema.profiles.id })
    .from(schema.profiles)
    .where(eq(schema.profiles.email, email.toLowerCase()))
    .limit(1);
  return row?.id ?? null;
}

/** Attach leftover public bookings to a profile after invite/login. */
export async function linkAppointmentsByEmail(db: Db, profileId: string, email: string) {
  await db
    .update(schema.appointments)
    .set({ clientId: profileId })
    .where(
      and(eq(schema.appointments.email, email.toLowerCase()), isNull(schema.appointments.clientId)),
    );
}

export async function insertAppointment(
  db: Db,
  values: {
    name: string;
    email: string;
    phone: string;
    area: string;
    startsAt: Date;
    mode: "presencial" | "videollamada";
    notes: string;
  },
) {
  const email = values.email.toLowerCase();
  const clientId = await findProfileIdByEmail(db, email);
  const [row] = await db
    .insert(schema.appointments)
    .values({ ...values, email, clientId })
    .returning({ id: schema.appointments.id });
  if (row) {
    await writeAudit(db, {
      actorId: clientId,
      action: "appointment.create",
      tableName: "appointments",
      recordId: row.id,
    });
  }
  return row;
}
