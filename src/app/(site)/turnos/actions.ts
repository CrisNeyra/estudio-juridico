"use server";

import { getService } from "@/content/services";
import { site } from "@/content/site";
import { sendMail } from "@/lib/email";
import { features } from "@/lib/env";
import { buildIcs } from "@/lib/ics";
import { logger } from "@/lib/logger";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  daySlots,
  formatSlot,
  isValidSlot,
  SLOT_MINUTES,
  toStartsAt,
  type Slot,
} from "@/lib/schedule";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { appointmentSchema, flattenErrors, type FieldErrors } from "@/lib/validation";

// Dev-only fallback when Supabase isn't configured (single process, not persistent).
const devBooked = new Set<number>();

async function bookedTimes(date: string): Promise<Set<number>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return devBooked;

  const start = toStartsAt(date, "00:00");
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const { data, error } = await supabase.rpc("booked_slots", {
    range_start: start.toISOString(),
    range_end: end.toISOString(),
  });
  if (error) {
    logger.error("appointments.booked_slots_failed", { error: error.message });
    throw new Error("booked_slots_failed");
  }
  return new Set((data as { starts_at: string }[]).map((r) => new Date(r.starts_at).getTime()));
}

export async function getSlots(date: string): Promise<{ slots: Slot[]; error?: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { slots: [], error: "Fecha inválida." };
  try {
    return { slots: daySlots(date, new Date(), await bookedTimes(date)) };
  } catch {
    return { slots: [], error: "No pudimos cargar los horarios. Probá de nuevo." };
  }
}

export type BookingState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
  summary?: string;
  ics?: string;
};

const FIELDS = ["name", "email", "phone", "area", "date", "time", "mode", "notes"] as const;

export async function bookAppointment(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const values = Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? "")]));
  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    const fieldErrors = flattenErrors(parsed.error);
    if (fieldErrors.website) return { status: "success", message: "Solicitud recibida." };
    return { status: "error", message: "Revisá los campos marcados.", fieldErrors, values };
  }

  const ip = await clientIp();
  if (!(await rateLimit("appointment", ip)).success) {
    return {
      status: "error",
      message: "Demasiados intentos. Probá de nuevo en unos minutos.",
      values,
    };
  }
  if (!(await verifyTurnstile(formData.get("cf-turnstile-response"), ip))) {
    return {
      status: "error",
      message: "No pudimos verificar que no seas un robot. Reintentá.",
      values,
    };
  }

  const data = parsed.data;
  const now = new Date();
  if (!isValidSlot(data.date, data.time, now)) {
    return {
      status: "error",
      message: "Ese horario ya no está disponible. Elegí otro.",
      fieldErrors: { time: "Horario no disponible." },
      values,
    };
  }

  const startsAt = toStartsAt(data.date, data.time);
  let appointmentId: string = crypto.randomUUID();

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: id, error } = await supabase.rpc("book_appointment", {
      p_name: data.name,
      p_email: data.email,
      p_phone: data.phone,
      p_area: data.area,
      p_starts_at: startsAt.toISOString(),
      p_mode: data.mode,
      p_notes: data.notes,
    });
    if (error) {
      const taken = error.message.includes("slot_taken");
      if (!taken) logger.error("appointments.book_failed", { error: error.message });
      return {
        status: "error",
        message: taken
          ? "Alguien reservó ese horario recién. Elegí otro."
          : "No pudimos registrar el turno. Probá de nuevo.",
        fieldErrors: taken ? { time: "Horario ocupado." } : undefined,
        values,
      };
    }
    appointmentId = String(id);
  } else {
    if (devBooked.has(startsAt.getTime())) {
      return {
        status: "error",
        message: "Ese horario ya está reservado.",
        fieldErrors: { time: "Horario ocupado." },
        values,
      };
    }
    devBooked.add(startsAt.getTime());
  }

  const area = getService(data.area)?.title ?? data.area;
  const when = formatSlot(data.date, data.time);
  const modeLabel = data.mode === "presencial" ? "Presencial" : "Videollamada";
  const location =
    data.mode === "presencial"
      ? site.contact.location
      : "Videollamada (te enviamos el enlace por email)";

  const ics = buildIcs({
    uid: `${appointmentId}@${new URL(site.url).hostname}`,
    start: startsAt,
    durationMinutes: SLOT_MINUTES,
    summary: `Consulta ${area} — ${site.name}`,
    description: `Turno ${modeLabel.toLowerCase()} con ${site.legalName}. Ante cualquier cambio, escribinos a ${site.contact.email}.`,
    location,
    organizerEmail: site.contact.email,
  });

  const [toStudio] = await Promise.all([
    sendMail({
      subject: `Nuevo turno: ${area} — ${when}`,
      replyTo: data.email,
      text: [
        `Nombre: ${data.name}`,
        `Email: ${data.email}`,
        `Teléfono: ${data.phone}`,
        `Área: ${area}`,
        `Fecha: ${when}`,
        `Modalidad: ${modeLabel}`,
        `Notas: ${data.notes || "-"}`,
        features.supabase
          ? `ID: ${appointmentId}`
          : "(Supabase no configurado: turno no persistido)",
      ].join("\n"),
    }),
    sendMail({
      to: data.email,
      subject: `Tu turno con ${site.name}: ${when}`,
      text: [
        `Hola ${data.name}:`,
        "",
        `Recibimos tu solicitud de turno para ${area}, el ${when} (${modeLabel.toLowerCase()}).`,
        "Te vamos a confirmar por este medio. Adjuntamos el evento para tu calendario.",
        "",
        `${site.legalName} — ${site.contact.phone}`,
      ].join("\n"),
      attachments: [{ filename: "turno.ics", content: ics, contentType: "text/calendar" }],
    }),
  ]);

  if (!toStudio.ok && !features.supabase) {
    return {
      status: "error",
      message: "No pudimos registrar el turno. Escribinos por WhatsApp.",
      values,
    };
  }

  logger.info("appointments.booked", {
    area: data.area,
    mode: data.mode,
    persisted: features.supabase,
  });
  return {
    status: "success",
    message:
      "Te enviamos un email con los detalles. Te confirmamos el turno dentro de las próximas horas hábiles.",
    summary: `${area} · ${when} · ${modeLabel}`,
    ics,
  };
}
