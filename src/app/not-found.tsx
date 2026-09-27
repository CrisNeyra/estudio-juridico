import Link from "next/link";

export default function NotFound() {
  return (
    <main id="contenido" className="container-page flex flex-1 flex-col justify-center py-24">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-6 display text-6xl md:text-9xl">
        Esta página <em className="text-brand">no existe.</em>
      </h1>
      <p className="mt-8 max-w-xl text-lg text-muted-foreground">
        Puede que el enlace esté roto o que la página se haya movido.
      </p>
      <div className="mt-10 flex flex-wrap gap-6">
        <Link href="/" className="link-underline">
          Volver al inicio
        </Link>
        <Link href="/servicios" className="link-underline">
          Ver servicios
        </Link>
      </div>
    </main>
  );
}
