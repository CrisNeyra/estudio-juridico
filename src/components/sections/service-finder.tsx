"use client";

import { ArrowRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { searchServices } from "@/lib/service-search";
import { openAssistant } from "@/lib/assistant-events";

const EXAMPLES = ["Me despidieron", "Choqué con el auto", "Quiero divorciarme", "Me intimó ARCA"];

export function ServiceFinder() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const results = useMemo(() => searchServices(deferred), [deferred]);
  const inputId = useId();
  const resultsId = useId();
  const hasQuery = deferred.trim().length >= 3;

  return (
    <div className="w-full max-w-2xl">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) openAssistant(query.trim());
        }}
        className="flex items-center gap-3 border-b-2 border-foreground/80 pb-3 transition-colors focus-within:border-brand"
      >
        <label htmlFor={inputId} className="sr-only">
          Contanos qué necesitás resolver
        </label>
        <Search
          className="size-5 shrink-0 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué necesitás resolver?"
          autoComplete="off"
          maxLength={300}
          aria-controls={resultsId}
          className="w-full bg-transparent font-serif text-2xl outline-none placeholder:text-muted-foreground/80 focus-visible:outline-none md:text-3xl"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-brand"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Preguntar al asistente</span>
          <span className="sm:hidden">Asistente</span>
        </button>
      </form>

      <div id={resultsId} aria-live="polite" className="mt-5 min-h-24">
        {hasQuery && results.length > 0 ? (
          <>
            <p className="mb-3 eyebrow">Te puede ayudar</p>
            <ul className="flex flex-col">
              {results.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/servicios/${s.slug}`}
                    className="group flex items-center justify-between gap-4 py-2 transition-colors hover:text-brand"
                  >
                    <span>
                      <span className="font-medium">{s.title}</span>
                      <span className="text-muted-foreground"> — {s.short}</span>
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : hasQuery ? (
          <p className="text-sm text-muted-foreground">
            No encontramos un área exacta. Probá con otras palabras o{" "}
            <button
              type="button"
              onClick={() => openAssistant(query.trim())}
              className="text-foreground link-underline"
            >
              consultá al asistente
            </button>
            .
          </p>
        ) : (
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Por ejemplo:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setQuery(ex)}
                className="rounded-full border border-border px-3 py-1 transition-colors hover:border-foreground hover:text-foreground"
              >
                {ex}
              </button>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
