"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { services } from "@/content/services";
import { requireStaff } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_BYTES, sanitizeFileName } from "@/lib/portal";

export type AdminState = { status: "idle" | "success" | "error"; message?: string };

const areaEnum = z.enum(services.map((s) => s.slug) as [string, ...string[]]);

const appointmentUpdate = z.object({
  id: z.uuid(),
  status: z.enum(["confirmado", "cancelado", "pendiente"]),
});

export async function updateAppointmentStatus(formData: FormData) {
  const { supabase } = await requireStaff();
  const parsed = appointmentUpdate.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { error } = await supabase
    .from("appointments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) logger.error("admin.appointment_update_failed", { error: error.message });
  revalidatePath("/admin");
}

const newCase = z.object({
  clientEmail: z.email("Email inválido."),
  title: z.string().trim().min(3, "Título demasiado corto.").max(160),
  area: areaEnum,
  reference: z.string().trim().max(80).optional().default(""),
});

export async function createCase(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const { supabase, user } = await requireStaff();
  const parsed = newCase.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const { data: client } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.clientEmail.toLowerCase())
    .maybeSingle<{ id: string }>();
  if (!client) {
    return {
      status: "error",
      message: "No existe un usuario con ese email. Invitalo primero desde Supabase (ver runbook).",
    };
  }

  const { data, error } = await supabase
    .from("cases")
    .insert({
      client_id: client.id,
      lawyer_id: user.id,
      title: parsed.data.title,
      area: parsed.data.area,
      reference: parsed.data.reference || null,
    })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) {
    logger.error("admin.case_create_failed", { error: error?.message });
    return { status: "error", message: "No pudimos crear el caso." };
  }
  redirect(`/admin/casos/${data.id}`);
}

const caseStatus = z.object({ id: z.uuid(), status: z.enum(["abierto", "en_tramite", "cerrado"]) });

export async function updateCaseStatus(formData: FormData) {
  const { supabase } = await requireStaff();
  const parsed = caseStatus.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await supabase.from("cases").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  revalidatePath(`/admin/casos/${parsed.data.id}`);
}

const newEvent = z.object({
  caseId: z.uuid(),
  title: z.string().trim().min(3, "Título demasiado corto.").max(160),
  description: z.string().trim().max(4000).optional().default(""),
});

export async function addCaseEvent(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const { supabase, user } = await requireStaff();
  const parsed = newEvent.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const { error } = await supabase.from("case_events").insert({
    case_id: parsed.data.caseId,
    author_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
  });
  if (error) return { status: "error", message: "No pudimos guardar la novedad." };
  await supabase
    .from("cases")
    .update({ status: "en_tramite" })
    .eq("id", parsed.data.caseId)
    .eq("status", "abierto");
  revalidatePath(`/admin/casos/${parsed.data.caseId}`);
  return { status: "success", message: "Novedad publicada. El cliente ya puede verla." };
}

const documentInput = z.object({
  caseId: z.uuid(),
  path: z.string().max(300),
  name: z.string().min(1).max(200),
  size: z.number().int().positive().max(MAX_DOCUMENT_BYTES),
  mimeType: z.enum(ALLOWED_DOCUMENT_TYPES),
});

/**
 * Files are uploaded straight from the browser to Supabase Storage (bucket policy: staff-only
 * insert; bucket limits enforce size/mime). This action then records the metadata, checking
 * the object really exists under the case folder so paths can't be spoofed.
 */
export async function registerDocument(input: z.input<typeof documentInput>): Promise<AdminState> {
  const { supabase, user } = await requireStaff();
  const parsed = documentInput.safeParse(input);
  if (!parsed.success) return { status: "error", message: "Archivo inválido." };
  const { caseId, path, name, size, mimeType } = parsed.data;

  const prefix = `${caseId}/`;
  const objectName = path.slice(prefix.length);
  if (!path.startsWith(prefix) || !/^[0-9a-f-]{36}-[a-zA-Z0-9._-]+$/.test(objectName)) {
    return { status: "error", message: "Ruta de archivo inválida." };
  }

  const { data: listed } = await supabase.storage
    .from("documents")
    .list(caseId, { search: objectName, limit: 1 });
  if (!listed?.some((o) => o.name === objectName)) {
    return { status: "error", message: "No encontramos el archivo subido." };
  }

  const { error } = await supabase.from("documents").insert({
    case_id: caseId,
    uploaded_by: user.id,
    name: sanitizeFileName(name),
    storage_path: path,
    size_bytes: size,
    mime_type: mimeType,
  });
  if (error) {
    logger.error("admin.document_register_failed", { error: error.message });
    await supabase.storage.from("documents").remove([path]);
    return { status: "error", message: "No pudimos registrar el documento." };
  }
  revalidatePath(`/admin/casos/${caseId}`);
  return { status: "success", message: "Documento compartido con el cliente." };
}
