"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, MessageCircle, Square, X } from "lucide-react";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { OPEN_ASSISTANT_EVENT, type OpenAssistantDetail } from "@/lib/assistant-events";
import { DISCLAIMER } from "@/lib/ai/disclaimer";
import { searchServices } from "@/lib/service-search";
import { site } from "@/content/site";

const INTERNAL_PATH = /(\/(?:turnos|contacto|servicios(?:\/[a-z-]+)?))(?=[\s.,;:!?)]|$)/g;

/** Turns internal paths mentioned by the assistant (e.g. "/turnos") into links. */
function RichText({ text }: { text: string }) {
  const parts = text.split(INTERNAL_PATH);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Link key={i} href={part} className="link-underline">
            {part === "/turnos" ? "pedir turno" : part === "/contacto" ? "contacto" : part}
          </Link>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function friendlyChatError(message?: string) {
  if (!message) return "No pude responder ahora.";
  try {
    const parsed = JSON.parse(message) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    /* not JSON */
  }
  return message;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const reduce = useReducedMotion();

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

  const pendingPrompt = useRef<string | null>(null);

  const send = useCallback(
    (text: string) => {
      const value = text.trim().slice(0, 1500);
      if (!value || busy) return;
      void sendMessage({ text: value });
      setInput("");
      inputRef.current?.focus();
    },
    [busy, sendMessage],
  );

  useEffect(() => {
    const onOpen = (e: Event) => {
      const { prompt } = (e as CustomEvent<OpenAssistantDetail>).detail ?? {};
      setOpen(true);
      if (!prompt) return;
      if (prompt.endsWith(": ")) {
        setInput(prompt);
        return;
      }
      pendingPrompt.current = prompt.trim().slice(0, 1500);
    };
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    const prompt = pendingPrompt.current;
    if (!open || !prompt || busy) return;
    pendingPrompt.current = null;
    void sendMessage({ text: prompt });
    setInput("");
  }, [open, busy, sendMessage]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const lastUserText = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "user");
    return last?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ") ?? "";
  }, [messages]);
  const suggestions = useMemo(() => searchServices(lastUserText, 2), [lastUserText]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Cerrar asistente virtual" : "Abrir asistente virtual"}
        className="fixed right-5 bottom-20 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground py-3 pr-5 pl-4 text-sm text-background shadow-lg transition-colors hover:bg-brand hover:text-brand-foreground md:right-8 md:bottom-24"
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <MessageCircle className="icon-pulse size-5" aria-hidden="true" />
        )}
        <span>{open ? "Cerrar" : "Asistente"}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.section
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-label="Asistente virtual"
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-3 bottom-36 z-40 flex max-h-[min(62vh,640px)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl sm:inset-x-auto sm:right-8 sm:w-[420px] md:bottom-40"
          >
            <header className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <p className="font-serif text-2xl leading-none">Asistente</p>
                <p className="mt-2 text-xs text-muted-foreground">{DISCLAIMER}</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="-m-2 p-2 text-muted-foreground hover:text-foreground"
                aria-label="Cerrar asistente"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </header>

            <div
              ref={scrollRef}
              data-lenis-prevent
              className="flex-1 space-y-4 overflow-y-auto p-5"
              aria-live="polite"
              aria-busy={busy}
            >
              {messages.length === 0 ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Hola. Contame brevemente tu situación y te indico qué área del estudio puede
                    ayudarte.
                  </p>
                  <p>Por ejemplo: “Me despidieron sin causa” o “Tengo que iniciar una sucesión”.</p>
                </div>
              ) : null}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-sm text-background"
                        : "max-w-[90%] text-sm leading-relaxed whitespace-pre-wrap"
                    }
                  >
                    <span className="sr-only">{m.role === "user" ? "Vos: " : "Asistente: "}</span>
                    {m.parts.map((p, i) =>
                      p.type === "text" ? <RichText key={i} text={p.text} /> : null,
                    )}
                  </div>
                </div>
              ))}

              {status === "submitted" ? (
                <p className="animate-pulse text-sm text-muted-foreground">Escribiendo…</p>
              ) : null}

              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {friendlyChatError(error.message)} Podés{" "}
                  <a
                    href={`https://wa.me/${site.contact.whatsapp}`}
                    className="link-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    escribirnos por WhatsApp
                  </a>{" "}
                  o{" "}
                  <Link href="/contacto" className="link-underline">
                    dejarnos tu consulta
                  </Link>
                  .
                </p>
              ) : null}

              {status === "ready" && suggestions.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {suggestions.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/servicios/${s.slug}`}
                      className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:border-foreground"
                    >
                      Ver {s.title}
                    </Link>
                  ))}
                  <Link
                    href="/turnos"
                    className="rounded-full bg-brand px-3 py-1 text-xs text-brand-foreground"
                  >
                    Pedir turno
                  </Link>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2 border-t border-border p-3"
            >
              <label htmlFor={`${panelId}-input`} className="sr-only">
                Escribí tu consulta
              </label>
              <textarea
                id={`${panelId}-input`}
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                maxLength={1500}
                placeholder="Escribí tu consulta…"
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary"
                  aria-label="Detener respuesta"
                >
                  <Square className="size-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors disabled:bg-secondary disabled:text-muted-foreground"
                  aria-label="Enviar"
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </button>
              )}
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );
}
