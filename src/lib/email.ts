import "server-only";
import { Resend } from "resend";
import { env, features } from "@/lib/env";
import { logger } from "@/lib/logger";

type Mail = {
  to?: string;
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string; contentType?: string }[];
};

export type SendResult = { ok: true; delivered: boolean } | { ok: false };

/**
 * Sends a transactional email via Resend. Without configuration it logs the email in
 * development (delivered: false) and fails in production so leads are never silently lost.
 */
export async function sendMail(mail: Mail): Promise<SendResult> {
  const to = mail.to ?? env.CONTACT_TO_EMAIL;

  if (!features.email || !to) {
    if (env.NODE_ENV === "production") {
      logger.error("email.not_configured", { subject: mail.subject });
      return { ok: false };
    }
    logger.info("email.dev_preview", {
      to: to ?? "(sin destinatario)",
      subject: mail.subject,
      text: mail.text,
    });
    return { ok: true, delivered: false };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.CONTACT_FROM_EMAIL ?? "Estudio <onboarding@resend.dev>",
    to,
    subject: mail.subject,
    text: mail.text,
    replyTo: mail.replyTo,
    attachments: mail.attachments?.map((a) => ({
      filename: a.filename,
      content: Buffer.from(a.content).toString("base64"),
      contentType: a.contentType,
    })),
  });

  if (error) {
    logger.error("email.send_failed", { subject: mail.subject, error: error.message });
    return { ok: false };
  }
  return { ok: true, delivered: true };
}
