"use client";

import { Sparkles } from "lucide-react";
import { openAssistant } from "@/lib/assistant-events";

export function AskAssistantButton({
  prompt,
  label = "Consultá al asistente",
}: {
  prompt?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openAssistant(prompt)}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-brand"
    >
      <Sparkles className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}
