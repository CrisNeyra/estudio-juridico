export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="container-page pt-16 pb-16 md:pt-28 md:pb-24">
      <div className="rise">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-6 max-w-5xl display text-5xl sm:text-6xl md:text-8xl">{title}</h1>
        {lead ? (
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">{lead}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
