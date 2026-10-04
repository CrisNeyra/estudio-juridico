import "server-only";
import nodemailer from "nodemailer";
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

function fromAddress() {
  if (env.CONTACT_FROM_EMAIL) return env.CONTACT_FROM_EMAIL;
  if (env.GMAIL_USER) return `Estudio <${env.GMAIL_USER}>`;
  return "Estudio <onboarding@resend.dev>";
}

async function sendViaGmail(mail: Mail, to: string): Promise<SendResult> {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: env.GMAIL_USER!,
      pass: env.GMAIL_APP_PASSWORD!,
    },
  });

  try {
    await transporter.sendMail({
      from: fromAddress(),
      to,
      subject: mail.subject,
      text: mail.text,
      replyTo: mail.replyTo,
      attachments: mail.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content),
        contentType: a.contentType,
      })),
    });
    return { ok: true, delivered: true };
  } catch (error) {
    logger.error("email.gmail_failed", {
      subject: mail.subject,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false };
  }
}

async function sendViaResend(mail: Mail, to: string): Promise<SendResult> {
  const from = fromAddress();
  const testFrom = /onboarding@resend\.dev/i.test(from);
  // Until a domain is verified, Resend only delivers to the account inbox.
  if (
    testFrom &&
    mail.to &&
    env.CONTACT_TO_EMAIL &&
    mail.to.toLowerCase() !== env.CONTACT_TO_EMAIL.toLowerCase()
  ) {
    logger.info("email.test_from_skip_client", { intended: mail.to });
    return { ok: true, delivered: false };
  }
  const recipient = testFrom && env.CONTACT_TO_EMAIL ? env.CONTACT_TO_EMAIL : to;

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from,
    to: recipient,
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

/**
 * Sends transactional email. Prefers Gmail SMTP (free, no domain) when configured;
 * otherwise Resend. Without either, logs in development and fails in production.
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

  if (features.gmail) return sendViaGmail(mail, to);
  return sendViaResend(mail, to);
}
