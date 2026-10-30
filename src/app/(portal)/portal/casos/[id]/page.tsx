import { FileText } from "lucide-react";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getService } from "@/content/services";
import { isStaff, requireStaff, requireUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { getAccessibleCase } from "@/lib/domain/authz";
import { caseStatusLabel, formatBytes, formatDateTime } from "@/lib/portal";

export default async function CasePage(props: PageProps<"/portal/casos/[id]">) {
  const { id } = await props.params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { profile } = await requireUser();
  if (isStaff(profile.role)) await requireStaff();
  const db = getDb()!;

  const kase = await getAccessibleCase(db, profile, id);
  if (!kase) notFound();

  const [events, documents] = await Promise.all([
    db
      .select({
        id: schema.caseEvents.id,
        title: schema.caseEvents.title,
        description: schema.caseEvents.description,
        occurredAt: schema.caseEvents.occurredAt,
      })
      .from(schema.caseEvents)
      .where(eq(schema.caseEvents.caseId, id))
      .orderBy(desc(schema.caseEvents.occurredAt)),
    db
      .select({
        id: schema.documents.id,
        name: schema.documents.name,
        sizeBytes: schema.documents.sizeBytes,
        mimeType: schema.documents.mimeType,
        createdAt: schema.documents.createdAt,
      })
      .from(schema.documents)
      .where(eq(schema.documents.caseId, id))
      .orderBy(desc(schema.documents.createdAt)),
  ]);

  const latestEvent = events[0];
  const latestDocument = documents[0];

  return (
    <div className="space-y-20">
      <header>
        <Link href="/portal" className="text-sm text-muted-foreground hover:text-foreground">
          ← Mis casos
        </Link>
        <p className="mt-10 eyebrow">
          {getService(kase.area)?.title ?? kase.area} · {caseStatusLabel[kase.status]}
          {kase.reference ? ` · ${kase.reference}` : ""}
        </p>
        <h1 className="mt-4 display text-4xl md:text-6xl">{kase.title}</h1>
      </header>

      <div className="grid gap-16 md:grid-cols-12">
        <section aria-labelledby="novedades" className="md:col-span-7">
          <h2 id="novedades" className="display text-3xl">
            Novedades
          </h2>
          {latestEvent == null ? (
            <p className="mt-6 text-muted-foreground">Aún no hay novedades registradas.</p>
          ) : (
            <>
              <article className="mt-8 border-l-2 border-brand bg-secondary p-6 md:p-8">
                <p className="eyebrow">Última novedad</p>
                <time
                  dateTime={latestEvent.occurredAt.toISOString()}
                  className="mt-4 block font-mono text-xs text-muted-foreground"
                >
                  {formatDateTime(latestEvent.occurredAt.toISOString())}
                </time>
                <h3 className="mt-2 font-serif text-3xl">{latestEvent.title}</h3>
                {latestEvent.description ? (
                  <p className="mt-3 whitespace-pre-line text-muted-foreground">
                    {latestEvent.description}
                  </p>
                ) : null}
              </article>
              {events.length > 1 ? (
                <ol className="mt-10 space-y-10 border-l border-border pl-8">
                  {events.slice(1).map((e) => (
                    <li key={e.id} className="relative">
                      <span
                        className="absolute top-2 -left-[37px] size-2 rounded-full bg-brand"
                        aria-hidden="true"
                      />
                      <time
                        dateTime={e.occurredAt.toISOString()}
                        className="font-mono text-xs text-muted-foreground"
                      >
                        {formatDateTime(e.occurredAt.toISOString())}
                      </time>
                      <h3 className="mt-2 font-serif text-2xl">{e.title}</h3>
                      {e.description ? (
                        <p className="mt-2 whitespace-pre-line text-muted-foreground">
                          {e.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : null}
            </>
          )}
        </section>

        <section aria-labelledby="documentos" className="md:col-span-4 md:col-start-9">
          <h2 id="documentos" className="display text-3xl">
            Documentos
          </h2>
          {latestDocument == null ? (
            <p className="mt-6 text-muted-foreground">No hay documentos compartidos.</p>
          ) : (
            <>
              <a
                href={`/portal/documentos/${latestDocument.id}`}
                className="mt-8 flex min-h-11 items-start gap-3 border border-border p-5 transition-colors hover:border-brand"
              >
                <FileText className="mt-1 size-5 shrink-0 text-brand" />
                <span>
                  <span className="eyebrow">Más reciente</span>
                  <span className="mt-2 block font-medium">{latestDocument.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(latestDocument.sizeBytes)}
                  </span>
                </span>
              </a>
              {documents.length > 1 ? (
                <ul className="mt-4 border-t border-border">
                  {documents.slice(1).map((d) => (
                    <li key={d.id} className="border-b border-border">
                      <a
                        href={`/portal/documentos/${d.id}`}
                        className="group flex min-h-11 items-start gap-3 py-4"
                      >
                        <FileText className="mt-1 size-5 shrink-0 text-muted-foreground" />
                        <span>
                          <span className="block font-medium group-hover:text-brand">{d.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatBytes(d.sizeBytes)}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
