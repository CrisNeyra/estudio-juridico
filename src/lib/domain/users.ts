import "server-only";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Role } from "@/lib/auth";
import type { Db } from "@/lib/db";
import { schema } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { features } from "@/lib/env";
import { writeAudit } from "@/lib/domain/audit";
import { linkAppointmentsByEmail } from "@/lib/domain/appointments";

export async function invitePortalUser(
  db: Db,
  input: {
    actorId: string;
    actorRole: Role;
    email: string;
    fullName: string;
    password: string;
    role: Role;
  },
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (input.role !== "cliente" && input.actorRole !== "admin") {
    return { ok: false, message: "Solo un admin puede invitar abogados o admins." };
  }

  const email = input.email.toLowerCase();
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  if (existing) return { ok: false, message: "Ya existe un usuario con ese email." };

  const passwordHash = await bcrypt.hash(input.password, 12);

  const created = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(schema.users)
      .values({
        email,
        name: input.fullName,
        passwordHash,
        emailVerified: new Date(),
      })
      .returning({ id: schema.users.id });
    if (!user) throw new Error("users.insert_empty");
    await tx.insert(schema.profiles).values({
      id: user.id,
      email,
      fullName: input.fullName,
      role: input.role,
    });
    return user;
  });

  await linkAppointmentsByEmail(db, created.id, email);
  await writeAudit(db, {
    actorId: input.actorId,
    action: "user.invite",
    tableName: "users",
    recordId: created.id,
  });

  if (features.email) {
    await sendMail({
      to: email,
      subject: "Acceso al portal de clientes",
      text: [
        `Hola ${input.fullName}:`,
        "",
        "Te creamos acceso al portal de clientes.",
        `Email: ${email}`,
        "",
        "La contraseña te la comunica el estudio por un canal seguro.",
        "Entrá en /portal/login y cambiala desde Seguridad.",
      ].join("\n"),
    });
  }

  return { ok: true };
}
