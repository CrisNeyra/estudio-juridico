export type CaseStatus = "abierto" | "en_tramite" | "cerrado";
export type AppointmentStatus = "pendiente" | "confirmado" | "cancelado";

export type CaseRow = {
  id: string;
  title: string;
  area: string;
  reference: string | null;
  status: CaseStatus;
  updated_at: string;
  client_id: string;
};

export type CaseEventRow = {
  id: string;
  title: string;
  description: string;
  occurred_at: string;
};

export type DocumentRow = {
  id: string;
  name: string;
  size_bytes: number;
  mime_type: string;
  created_at: string;
};

export type AppointmentRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  starts_at: string;
  mode: "presencial" | "videollamada";
  notes: string;
  status: AppointmentStatus;
};

export const caseStatusLabel: Record<CaseStatus, string> = {
  abierto: "Abierto",
  en_tramite: "En trámite",
  cerrado: "Cerrado",
};

export const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

const TZ = "America/Argentina/Buenos_Aires";

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeZone: TZ }).format(
    new Date(iso),
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

export function sanitizeFileName(name: string): string {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "");
  return cleaned.slice(-120) || "documento";
}
