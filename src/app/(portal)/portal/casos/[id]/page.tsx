import { FileText } from "lucide-react";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getService } from "@/content/services";
import { isStaff, requireUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { caseStatusLabel, formatBytes, formatDateTime } from "@/lib/portal";

export default async function CasePage(props: PageProps<"/portal/casos/[id]">) {
  const { id } = await props.params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { profile } = await requireUser();
  const db = getDb()!;
  const staff = isStaff(profile.role);

  const [kase] = await db
    .select()
    .from(schema.cases)
    .where(
      staff
        ? eq(schema.cases.id, id)
        : and(eq(schema.cases.id, id), eq(schema.cases.clientId, profile.id)),
    )
    .limit(1);
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
          {events.length === 0 ? (
            <p className="mt-6 text-muted-foreground">Aún no hay novedades registradas.</p>
          ) : (
            <ol className="mt-8 space-y-10 border-l border-border pl-8">
              {events.map((e) => (
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
          )}
        </section>

        <section aria-labelledby="documentos" className="md:col-span-4 md:col-start-9">
          <h2 id="documentos" className="display text-3xl">
            Documentos
          </h2>
          {documents.length === 0 ? (
            <p className="mt-6 text-muted-foreground">No hay documentos compartidos.</p>
          ) : (
            <ul className="mt-8 border-t border-border">
              {documents.map((d) => (
                <li key={d.id} className="border-b border-border">
                  <a
                    href={`/portal/documentos/${d.id}`}
                    className="group flex items-start gap-3 py-4"
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
          )}
        </section>
      </div>
    </div>
  );
}
