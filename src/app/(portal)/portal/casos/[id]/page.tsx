import { FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getService } from "@/content/services";
import { requireUser } from "@/lib/auth";
import {
  caseStatusLabel,
  formatBytes,
  formatDateTime,
  type CaseEventRow,
  type CaseRow,
  type DocumentRow,
} from "@/lib/portal";

export default async function CasePage(props: PageProps<"/portal/casos/[id]">) {
  const { id } = await props.params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { supabase } = await requireUser();

  // RLS guarantees a client only sees their own case; staff see all.
  const { data: kase } = await supabase
    .from("cases")
    .select("id, title, area, reference, status, updated_at, client_id")
    .eq("id", id)
    .maybeSingle<CaseRow>();
  if (!kase) notFound();

  const [{ data: events }, { data: documents }] = await Promise.all([
    supabase
      .from("case_events")
      .select("id, title, description, occurred_at")
      .eq("case_id", id)
      .order("occurred_at", { ascending: false })
      .returns<CaseEventRow[]>(),
    supabase
      .from("documents")
      .select("id, name, size_bytes, mime_type, created_at")
      .eq("case_id", id)
      .order("created_at", { ascending: false })
      .returns<DocumentRow[]>(),
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
          {!events || events.length === 0 ? (
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
                    dateTime={e.occurred_at}
                    className="font-mono text-xs text-muted-foreground"
                  >
                    {formatDateTime(e.occurred_at)}
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
          {!documents || documents.length === 0 ? (
            <p className="mt-6 text-muted-foreground">No hay documentos compartidos.</p>
          ) : (
            <ul className="mt-8 border-t border-border">
              {documents.map((d) => (
                <li key={d.id} className="border-b border-border">
                  <a
                    href={`/portal/documentos/${d.id}`}
                    className="group flex items-start gap-3 py-4 hover:text-brand"
                  >
                    <FileText
                      className="mt-0.5 size-5 shrink-0"
                      strokeWidth={1.25}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block truncate">{d.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(d.size_bytes)} · {formatDateTime(d.created_at)}
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
