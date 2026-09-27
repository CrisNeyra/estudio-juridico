import { z } from "zod";
import { services } from "@/content/services";

const serviceSlugs = services.map((s) => s.slug) as [string, ...string[]];

/** Strips control characters (except newlines/tabs) that could break emails or logs. */
const clean = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const name = z
  .string()
  .transform(clean)
  .pipe(z.string().min(2, "Ingresá tu nombre.").max(100, "El nombre es demasiado largo."));

const email = z.string().transform(clean).pipe(z.email("Ingresá un email válido.").max(160));

const phone = z
  .string()
  .transform(clean)
  .pipe(
    z
      .string()
      .max(30)
      .regex(/^[+\d\s()-]*$/, "El teléfono solo puede tener números, espacios y + ( ) -."),
  );

export const contactSchema = z.object({
  name,
  email,
  phone: phone.optional().default(""),
  area: z.enum([...serviceSlugs, "otra"], { error: "Elegí un área." }),
  message: z
    .string()
    .transform(clean)
    .pipe(
      z
        .string()
        .min(20, "Contanos un poco más (mínimo 20 caracteres).")
        .max(3000, "El mensaje es demasiado largo (máximo 3000 caracteres)."),
    ),
  consent: z.literal("on", { error: "Necesitamos tu consentimiento para responderte." }),
  // Honeypot: real users never see this field.
  website: z.string().max(0).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const chatMessageSchema = z
  .object({
    id: z.string().max(100),
    role: z.enum(["user", "assistant"]),
    parts: z
      .array(
        z
          .object({
            type: z.string().max(40),
            text: z.string().max(2000).optional(),
          })
          .loose(),
      )
      .max(20),
  })
  .loose();

export const chatRequestSchema = z
  .object({
    messages: z.array(chatMessageSchema).min(1).max(30),
  })
  .loose();

export const appointmentSchema = z.object({
  name,
  email,
  phone: phone.pipe(z.string().min(6, "Ingresá un teléfono de contacto.")),
  area: z.enum(serviceSlugs, { error: "Elegí un área." }),
  date: z.iso.date("Elegí una fecha válida."),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Elegí un horario."),
  mode: z.enum(["presencial", "videollamada"], { error: "Elegí la modalidad." }),
  notes: z.string().transform(clean).pipe(z.string().max(1000)).optional().default(""),
  consent: z.literal("on", { error: "Necesitamos tu consentimiento para agendar el turno." }),
  website: z.string().max(0).optional().default(""),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export type FieldErrors = Partial<Record<string, string>>;

export function flattenErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
