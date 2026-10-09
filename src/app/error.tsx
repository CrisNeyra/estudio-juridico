"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="contenido" className="container-page flex flex-1 flex-col justify-center py-24">
      <p className="eyebrow">Error</p>
      <h1 className="mt-6 display text-6xl md:text-8xl">
        Algo <em className="text-brand">no salió bien.</em>
      </h1>
      <p className="mt-8 max-w-xl text-lg text-muted-foreground">
        Probá de nuevo. Si sigue fallando, escribinos o volvé al inicio.
      </p>
      <div className="mt-10 flex flex-wrap gap-6">
        <button type="button" onClick={reset} className="link-underline">
          Reintentar
        </button>
        <Link href="/" className="link-underline">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
