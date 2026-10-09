"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-AR">
      <body className="flex min-h-full flex-col bg-white text-zinc-900">
        <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center px-6 py-24">
          <p className="text-xs tracking-[0.2em] uppercase">Error</p>
          <h1 className="mt-6 font-serif text-5xl">Algo no salió bien.</h1>
          <p className="mt-6 text-lg text-zinc-600">
            Recargá la página. Si el problema continúa, contactá al estudio.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-10 self-start underline underline-offset-4"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
