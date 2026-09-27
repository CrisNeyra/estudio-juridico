import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AddEventForm, UploadDocumentForm } from "@/components/portal/admin-forms";
import { getService } from "@/content/services";
import { requireStaff } from "@/lib/auth";
import {
  caseStatusLabel,
  formatBytes,
  formatDateTime,
  type CaseEventRow,
  type CaseRow,
  type DocumentRow,
} from "@/lib/portal";
import { updateCaseStatus } from "../../actions";

export default async function AdminCasePage(props: PageProps<"/admin/casos/[id]">) {
  const { id } = await props.params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase } = await requireStaff();

  const { data: kase } = await supabase
    .from("cases")
    .select("id, title, area, reference, status, updated_at, client_id")
    .eq("id", id)
    .maybeSingle<CaseRow>();
  if (!kase) notFound();

  const [{ data: client }, { data: events }, { data: documents }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", kase.client_id)
      .maybeSingle<{ full_name: string; email: string }>(),
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
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Panel
        </Link>
        <p className="mt-10 eyebrow">
          {getService(kase.area)?.title ?? kase.area}
          {kase.reference ? ` · ${kase.reference}` : ""}
        </p>
        <h1 className="mt-4 display text-4xl md:text-6xl">{kase.title}</h1>
        <p className="mt-4 text-muted-foreground">
          Cliente: {client?.full_name || "—"} · {client?.email}
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
            {(events ?? []).map((e) => (
              <li key={e.id}>
                <time className="font-mono text-xs text-muted-foreground">
                  {formatDateTime(e.occurred_at)}
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
          <ul className="mt-6 space-y-3 text-sm">
            {(documents ?? []).map((d) => (
              <li key={d.id}>
                <a href={`/portal/documentos/${d.id}`} className="link-underline">
                  {d.name}
                </a>{" "}
                <span className="text-muted-foreground">· {formatBytes(d.size_bytes)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
