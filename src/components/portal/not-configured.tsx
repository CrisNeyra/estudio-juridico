export function NotConfigured() {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">Portal de clientes</p>
      <h1 className="mt-6 display text-5xl md:text-7xl">Próximamente.</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        El portal de clientes todavía no está habilitado. Mientras tanto, podés consultar el estado
        de tu caso escribiéndonos o llamando al estudio.
      </p>
      {process.env.NODE_ENV !== "production" ? (
        <p className="mt-6 text-sm text-muted-foreground">
          En local: configurá <code>DATABASE_URL</code> y <code>AUTH_SECRET</code> (ver{" "}
          <code>docs/runbooks/neon-setup.md</code>).
        </p>
      ) : null}
    </div>
  );
}
