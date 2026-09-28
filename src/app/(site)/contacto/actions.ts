"use server";

import { getService } from "@/content/services";
import { sendMail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { contactSchema, flattenErrors, type FieldErrors } from "@/lib/validation";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
};

const FIELDS = ["name", "email", "phone", "area", "message"] as const;

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? "")]));
  const raw = Object.fromEntries(formData.entries());

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = flattenErrors(parsed.error);
    if (fieldErrors.website) {
      // Honeypot filled: pretend success so bots don't learn anything.
      return { status: "success", message: "¡Gracias! Recibimos tu consulta." };
    }
    return { status: "error", message: "Revisá los campos marcados.", fieldErrors, values };
  }

  const ip = await clientIp();
  const limit = await rateLimit("contact", ip);
  if (!limit.success) {
    return {
      status: "error",
      message: "Recibimos demasiados envíos desde tu conexión. Probá de nuevo en unos minutos.",
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
  const areaTitle = getService(data.area)?.title ?? "Otra consulta";

  const result = await sendMail({
    subject: `Nueva consulta web: ${areaTitle} — ${data.name}`,
    replyTo: data.email,
    text: [
      `Nombre: ${data.name}`,
      `Email: ${data.email}`,
      `Teléfono: ${data.phone || "-"}`,
      `Área: ${areaTitle}`,
      "",
      data.message,
    ].join("\n"),
  });

  if (!result.ok) {
    return {
      status: "error",
      message: "No pudimos enviar tu consulta. Escribinos por WhatsApp o llamanos.",
      values,
    };
  }

  logger.info("contact.submitted", { area: data.area, delivered: result.delivered });
  return {
    status: "success",
    message:
      "¡Gracias! Recibimos tu consulta. Te vamos a escribir para orientarte sobre los próximos pasos.",
  };
}
