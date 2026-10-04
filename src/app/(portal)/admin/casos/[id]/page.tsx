import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AddEventForm, UploadDocumentForm } from "@/components/portal/admin-forms";
import { getService } from "@/content/services";
import { requireStaff } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { caseStatusLabel, formatBytes, formatDateTime } from "@/lib/portal";
import { updateCaseStatus } from "../../actions";

export default async function AdminCasePage(props: PageProps<"/admin/casos/[id]">) {
  const { id } = await props.params;
  if (!z.uuid().safeParse(id).success) notFound();
  await requireStaff();
  const db = getDb()!;

  const [kase] = await db.select().from(schema.cases).where(eq(schema.cases.id, id)).limit(1);
  if (!kase) notFound();

  const [[client], events, documents] = await Promise.all([
    db
      .select({ fullName: schema.profiles.fullName, email: schema.profiles.email })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, kase.clientId))
      .limit(1),
    db
      .select()
      .from(schema.caseEvents)
      .where(eq(schema.caseEvents.caseId, id))
      .orderBy(desc(schema.caseEvents.occurredAt)),
    db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.caseId, id))
      .orderBy(desc(schema.documents.createdAt)),
  ]);

  return (
    <div className="space-y-20">
      <header>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Panel
        </Link>
        <p className="mt-10 eyebrow">
          {getService(kase.area)?.title ?? kase.area}
          {kase.reference ? ` · ${kase.reference}` : ""}
        </p>
        <h1 className="mt-4 display text-4xl md:text-6xl">{kase.title}</h1>
        <p className="mt-4 text-muted-foreground">
          Cliente: {client?.fullName || "—"} · {client?.email}
        </p>
        <form action={updateCaseStatus} className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <input type="hidden" name="id" value={kase.id} />
          <label htmlFor="status" className="eyebrow">
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue={kase.status}
            className="rounded-full border border-border bg-transparent px-4 py-2"
          >
            {Object.entries(caseStatusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" className="link-underline">
            Actualizar
          </button>
        </form>
      </header>

      <div className="grid gap-16 md:grid-cols-2">
        <section aria-labelledby="nueva-novedad">
          <h2 id="nueva-novedad" className="mb-8 display text-3xl">
            Publicar novedad
          </h2>
          <AddEventForm caseId={kase.id} />
        </section>
        <section aria-labelledby="subir">
          <h2 id="subir" className="mb-8 display text-3xl">
            Compartir documento
          </h2>
          <UploadDocumentForm caseId={kase.id} />
        </section>
      </div>

      <div className="grid gap-16 md:grid-cols-2">
        <section aria-labelledby="historial">
          <h2 id="historial" className="display text-3xl">
            Historial
          </h2>
          <ol className="mt-6 space-y-6">
            {events.map((e) => (
              <li key={e.id}>
                <time className="font-mono text-xs text-muted-foreground">
                  {formatDateTime(e.occurredAt.toISOString())}
                </time>
                <p className="font-serif text-xl">{e.title}</p>
                {e.description ? (
                  <p className="text-sm whitespace-pre-line text-muted-foreground">
                    {e.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="docs">
          <h2 id="docs" className="display text-3xl">
            Documentos
          </h2>
          <ul className="mt-6 space-y-3">
            {documents.map((d) => (
              <li key={d.id}>
                <a href={`/portal/documentos/${d.id}`} className="link-underline">
                  {d.name}
                </a>
                <span className="ml-2 text-sm text-muted-foreground">
                  {formatBytes(d.sizeBytes)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
