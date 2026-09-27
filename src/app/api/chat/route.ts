import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { env, features } from "@/lib/env";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { searchServices } from "@/lib/service-search";
import { chatRequestSchema } from "@/lib/validation";

export const maxDuration = 30;

const MAX_HISTORY = 10;
const MAX_CHARS_PER_MESSAGE = 1500;

function json(status: number, error: string, extra: Record<string, string> = {}) {
  return Response.json({ error }, { status, headers: extra });
}

/** Keeps only the last N text parts from user/assistant so clients can't inject other part types. */
function sanitize(
  messages: { id: string; role: "user" | "assistant"; parts: { type: string; text?: string }[] }[],
): UIMessage[] {
  return messages.slice(-MAX_HISTORY).map((m) => ({
    id: m.id,
    role: m.role,
    parts: m.parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => ({ type: "text" as const, text: p.text!.slice(0, MAX_CHARS_PER_MESSAGE) })),
  }));
}

function mockResponse(lastUserText: string) {
  const match = searchServices(lastUserText, 1)[0];
  const text = match
    ? `Entiendo tu situación. Por lo que contás, corresponde al área de ${match.title}. Esta es una orientación general: te recomendamos pedir un turno en /turnos para que un abogado analice tu caso.`
    : "Gracias por escribir. Contame un poco más sobre tu situación para indicarte qué área puede ayudarte, o pedí un turno en /turnos.";

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: "mock" });
      for (const word of text.split(/(\s+)/)) {
        writer.write({ type: "text-delta", id: "mock", delta: word });
      }
      writer.write({ type: "text-end", id: "mock" });
      writer.write({ type: "finish" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export async function POST(req: Request) {
  if (!features.ai) {
    return json(503, "El asistente no está disponible en este momento.");
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 64_000) return json(413, "La conversación es demasiado larga.");

  const limit = await rateLimit("chat");
  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000));
    return json(429, "Alcanzaste el límite de mensajes. Probá de nuevo en unos minutos.", {
      "Retry-After": String(retryAfter),
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, "Solicitud inválida.");
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return json(400, "Solicitud inválida.");

  const messages = sanitize(parsed.data.messages);
  const last = messages.at(-1);
  if (!last || last.role !== "user" || last.parts.length === 0) {
    return json(400, "Solicitud inválida.");
  }

  if (env.AI_MOCK === "1") {
    const lastText = last.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ");
    return mockResponse(lastText);
  }

  const result = streamText({
    model: google(env.GEMINI_MODEL),
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 400,
    temperature: 0.4,
    maxRetries: 1,
    abortSignal: req.signal,
    onError: ({ error }) => {
      logger.error("chat.stream_error", {
        error: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
