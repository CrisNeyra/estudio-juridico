"use server";

import { put, del } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { services } from "@/content/services";
import { requireStaff } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { features } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_BYTES, sanitizeFileName } from "@/lib/portal";
import bcrypt from "bcryptjs";
import { sendMail } from "@/lib/email";

export type AdminState = { status: "idle" | "success" | "error"; message?: string };

const areaEnum = z.enum(services.map((s) => s.slug) as [string, ...string[]]);

const appointmentUpdate = z.object({
  id: z.uuid(),
  status: z.enum(["confirmado", "cancelado", "pendiente"]),
});

export async function updateAppointmentStatus(formData: FormData) {
  await requireStaff();
  const db = getDb();
  if (!db) return;
  const parsed = appointmentUpdate.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await db
    .update(schema.appointments)
    .set({ status: parsed.data.status })
    .where(eq(schema.appointments.id, parsed.data.id));
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

  const [created] = await db
    .insert(schema.cases)
    .values({
      clientId: client.id,
      lawyerId: user.id,
      title: parsed.data.title,
      area: parsed.data.area,
      reference: parsed.data.reference || null,
    })
    .returning({ id: schema.cases.id });
  if (!created) {
    logger.error("admin.case_create_failed", {});
    return { status: "error", message: "No pudimos crear el caso." };
  }
  redirect(`/admin/casos/${created.id}`);
}

const caseStatus = z.object({ id: z.uuid(), status: z.enum(["abierto", "en_tramite", "cerrado"]) });

export async function updateCaseStatus(formData: FormData) {
  await requireStaff();
  const db = getDb();
  if (!db) return;
  const parsed = caseStatus.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await db
    .update(schema.cases)
    .set({ status: parsed.data.status })
    .where(eq(schema.cases.id, parsed.data.id));
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

  await db.insert(schema.caseEvents).values({
    caseId: parsed.data.caseId,
    authorId: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
  });
  await db
    .update(schema.cases)
    .set({ status: "en_tramite" })
    .where(and(eq(schema.cases.id, parsed.data.caseId), eq(schema.cases.status, "abierto")));
  revalidatePath(`/admin/casos/${parsed.data.caseId}`);
  return { status: "success", message: "Novedad publicada. El cliente ya puede verla." };
}

const inviteSchema = z.object({
  email: z.email(),
  fullName: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(200),
  role: z.enum(["cliente", "abogado", "admin"]).default("cliente"),
});

/** Invite a client or staff member (creates Auth.js user + profile). */
export async function inviteUser(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireStaff();
  const db = getDb();
  if (!db) return { status: "error", message: "Base de datos no configurada." };
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const email = parsed.data.email.toLowerCase();
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  if (existing) return { status: "error", message: "Ya existe un usuario con ese email." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      name: parsed.data.fullName,
      passwordHash,
      emailVerified: new Date(),
    })
    .returning({ id: schema.users.id });
  if (!user) return { status: "error", message: "No pudimos crear el usuario." };

  await db.insert(schema.profiles).values({
    id: user.id,
    email,
    fullName: parsed.data.fullName,
    role: parsed.data.role,
  });

  if (features.email) {
    await sendMail({
      to: email,
      subject: "Acceso al portal de clientes",
      text: [
        `Hola ${parsed.data.fullName}:`,
        "",
        "Te creamos acceso al portal.",
        `Email: ${email}`,
        `Contraseña temporal: ${parsed.data.password}`,
        "",
        "Entrá en /portal/login y cambiá la contraseña desde Seguridad.",
      ].join("\n"),
    });
  }

  revalidatePath("/admin");
  return { status: "success", message: "Usuario invitado. Ya puede ingresar al portal." };
}

export async function uploadDocument(formData: FormData): Promise<AdminState> {
  const { user } = await requireStaff();
  const db = getDb();
  if (!db) return { status: "error", message: "Base de datos no configurada." };
  if (!features.blob) return { status: "error", message: "Vercel Blob no está configurado." };

  const caseId = String(formData.get("caseId") ?? "");
  const file = formData.get("file");
  if (!z.uuid().safeParse(caseId).success) return { status: "error", message: "Caso inválido." };
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Elegí un archivo." };
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { status: "error", message: "El archivo supera los 20 MB." };
  }
  if (!(ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(file.type)) {
    return { status: "error", message: "Formato no permitido. Usá PDF, imágenes o Word." };
  }

  const path = `cases/${caseId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  let blobUrl: string | undefined;
  try {
    const blob = await put(path, file, {
      access: "private",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    blobUrl = blob.url;
    await db.insert(schema.documents).values({
      caseId,
      uploadedBy: user.id,
      name: sanitizeFileName(file.name),
      storagePath: blob.url,
      sizeBytes: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    logger.error("admin.document_upload_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (blobUrl) {
      try {
        await del(blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch {
        /* ignore */
      }
    }
    return { status: "error", message: "No pudimos subir el documento." };
  }

  revalidatePath(`/admin/casos/${caseId}`);
  return { status: "success", message: "Documento compartido con el cliente." };
}
