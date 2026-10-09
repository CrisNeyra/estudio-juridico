"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { services } from "@/content/services";
import { requireStaff } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { writeAudit } from "@/lib/domain/audit";
import { addCaseEventRecord, createCaseRecord } from "@/lib/domain/cases";
import { uploadCaseDocument } from "@/lib/domain/documents";
import { invitePortalUser } from "@/lib/domain/users";
import { features } from "@/lib/env";
import { logger } from "@/lib/logger";
import { eq } from "drizzle-orm";

export type AdminState = { status: "idle" | "success" | "error"; message?: string };

const areaEnum = z.enum(services.map((s) => s.slug) as [string, ...string[]]);

const appointmentUpdate = z.object({
  id: z.uuid(),
  status: z.enum(["confirmado", "cancelado", "pendiente"]),
});

export async function updateAppointmentStatus(formData: FormData) {
  const { user } = await requireStaff();
  const db = getDb();
  if (!db) return;
  const parsed = appointmentUpdate.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await db
    .update(schema.appointments)
    .set({ status: parsed.data.status })
    .where(eq(schema.appointments.id, parsed.data.id));
  await writeAudit(db, {
    actorId: user.id,
    action: "appointment.status",
    tableName: "appointments",
    recordId: parsed.data.id,
  });
  revalidatePath("/admin");
}

const newCase = z.object({
  clientEmail: z.email("Email inválido."),
  title: z.string().trim().min(3, "Título demasiado corto.").max(160),
  area: areaEnum,
  reference: z.string().trim().max(80).optional().default(""),
});

export async function createCase(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const { user } = await requireStaff();
  const db = getDb();
  if (!db) return { status: "error", message: "Base de datos no configurada." };
  const parsed = newCase.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const [client] = await db
    .select({ id: schema.profiles.id })
    .from(schema.profiles)
    .where(eq(schema.profiles.email, parsed.data.clientEmail.toLowerCase()))
    .limit(1);
  if (!client) {
    return {
      status: "error",
      message: "No existe un usuario con ese email. Invitalo primero desde Administración.",
    };
  }

  const created = await createCaseRecord(db, {
    actorId: user.id,
    clientId: client.id,
    title: parsed.data.title,
    area: parsed.data.area,
    reference: parsed.data.reference || null,
  });
  if (!created) {
    logger.error("admin.case_create_failed", {});
    return { status: "error", message: "No pudimos crear el caso." };
  }
  redirect(`/admin/casos/${created.id}`);
}

const caseStatus = z.object({ id: z.uuid(), status: z.enum(["abierto", "en_tramite", "cerrado"]) });

export async function updateCaseStatus(formData: FormData) {
  const { user } = await requireStaff();
  const db = getDb();
  if (!db) return;
  const parsed = caseStatus.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await db
    .update(schema.cases)
    .set({ status: parsed.data.status })
    .where(eq(schema.cases.id, parsed.data.id));
  await writeAudit(db, {
    actorId: user.id,
    action: "case.status",
    tableName: "cases",
    recordId: parsed.data.id,
  });
  revalidatePath(`/admin/casos/${parsed.data.id}`);
}

const newEvent = z.object({
  caseId: z.uuid(),
  title: z.string().trim().min(3, "Título demasiado corto.").max(160),
  description: z.string().trim().max(4000).optional().default(""),
});

export async function addCaseEvent(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const { user } = await requireStaff();
  const db = getDb();
  if (!db) return { status: "error", message: "Base de datos no configurada." };
  const parsed = newEvent.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  try {
    await addCaseEventRecord(db, {
      actorId: user.id,
      caseId: parsed.data.caseId,
      title: parsed.data.title,
      description: parsed.data.description,
    });
  } catch (error) {
    logger.error("admin.case_event_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { status: "error", message: "No pudimos publicar la novedad." };
  }
  revalidatePath(`/admin/casos/${parsed.data.caseId}`);
  return { status: "success", message: "Novedad publicada. El cliente ya puede verla." };
}

const inviteSchema = z.object({
  email: z.email(),
  fullName: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(200),
  role: z.enum(["cliente", "abogado", "admin"]).default("cliente"),
});

export async function inviteUser(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const { user, profile: actor } = await requireStaff();
  const db = getDb();
  if (!db) return { status: "error", message: "Base de datos no configurada." };
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  let result: Awaited<ReturnType<typeof invitePortalUser>>;
  try {
    result = await invitePortalUser(db, {
      actorId: user.id,
      actorRole: actor.role,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      password: parsed.data.password,
      role: parsed.data.role,
    });
  } catch (error) {
    logger.error("admin.invite_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { status: "error", message: "No pudimos crear el usuario." };
  }
  if (!result.ok) return { status: "error", message: result.message };

  revalidatePath("/admin");
  return {
    status: "success",
    message: "Usuario creado. Comunicá la contraseña por un canal seguro (no se envía por email).",
  };
}

export async function uploadDocument(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const { user } = await requireStaff();
  const db = getDb();
  if (!db) return { status: "error", message: "Base de datos no configurada." };
  if (!features.blob) return { status: "error", message: "Vercel Blob no está configurado." };

  const caseId = String(formData.get("caseId") ?? "");
  const file = formData.get("file");
  if (!z.uuid().safeParse(caseId).success) return { status: "error", message: "Caso inválido." };
  if (!(file instanceof File)) return { status: "error", message: "Elegí un archivo." };

  try {
    const result = await uploadCaseDocument(db, { actorId: user.id, caseId, file });
    if (!result.ok) return { status: "error", message: result.message };
  } catch (error) {
    logger.error("admin.document_upload_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { status: "error", message: "No pudimos subir el documento." };
  }

  revalidatePath(`/admin/casos/${caseId}`);
  return { status: "success", message: "Documento compartido con el cliente." };
}
