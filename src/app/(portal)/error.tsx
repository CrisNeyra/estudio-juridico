"use client";

import Link from "next/link";

export default function PortalErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-16">
      <p className="eyebrow">Error</p>
      <h1 className="mt-6 display text-5xl md:text-7xl">
        No pudimos <em className="text-brand">cargar el portal.</em>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Reintentá. Si persiste, cerrá sesión y volvé a entrar.
      </p>
      <div className="mt-10 flex flex-wrap gap-6">
        <button type="button" onClick={reset} className="link-underline">
          Reintentar
        </button>
        <Link href="/portal" className="link-underline">
          Ir al portal
        </Link>
      </div>
    </div>
  );
}
