export function ProsePage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="container-page pt-16 md:pt-28">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-6 display text-5xl md:text-7xl">{title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Última actualización: {updated}</p>
      <div className="mt-12 max-w-3xl space-y-5 text-lg [&_a]:link-underline [&_h2]:mt-12 [&_h2]:display [&_h2]:text-3xl [&_li]:ml-6 [&_li]:list-disc [&_p]:text-muted-foreground [&_ul]:space-y-2 [&_ul]:text-muted-foreground">
        {children}
      </div>
    </article>
  );
}
