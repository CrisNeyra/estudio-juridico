import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { NotConfigured } from "@/components/portal/not-configured";
import { getService } from "@/content/services";
import { getAuthContext, requireUser } from "@/lib/auth";
import {
  appointmentStatusLabel,
  caseStatusLabel,
  formatDateTime,
  formatDay,
  type AppointmentRow,
  type CaseRow,
} from "@/lib/portal";

export default async function PortalHome() {
  const ctx = await getAuthContext();
  if (!ctx.configured) return <NotConfigured />;

  const { supabase, profile } = await requireUser();

  const [{ data: cases }, { data: appointments }] = await Promise.all([
    supabase
      .from("cases")
      .select("id, title, area, reference, status, updated_at, client_id")
      .eq("client_id", profile.id)
      .order("updated_at", { ascending: false })
      .returns<CaseRow[]>(),
    supabase
      .from("appointments")
      .select("id, name, email, phone, area, starts_at, mode, notes, status")
      .eq("client_id", profile.id)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .returns<AppointmentRow[]>(),
  ]);

  const firstName = profile.full_name.split(" ")[0] || "";

  return (
    <div className="space-y-24">
      <header>
        <p className="eyebrow">Portal de clientes</p>
        <h1 className="mt-6 display text-5xl md:text-7xl">
          Hola{firstName ? `, ${firstName}` : ""}.
        </h1>
      </header>

      <section aria-labelledby="casos">
        <h2 id="casos" className="display text-3xl md:text-4xl">
          Mis casos
        </h2>
        {!cases || cases.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            Todavía no tenés casos asociados a tu cuenta.
          </p>
        ) : (
          <ul className="mt-8 border-t border-border">
            {cases.map((c) => (
              <li key={c.id} className="border-b border-border">
                <Link
                  href={`/portal/casos/${c.id}`}
                  className="group grid gap-2 py-6 md:grid-cols-12 md:items-center md:gap-6"
                >
                  <span className="eyebrow md:col-span-2">{caseStatusLabel[c.status]}</span>
                  <span className="font-serif text-2xl transition-colors group-hover:text-brand md:col-span-6">
                    {c.title}
                  </span>
                  <span className="text-sm text-muted-foreground md:col-span-3">
                    {getService(c.area)?.title ?? c.area} · act. {formatDay(c.updated_at)}
                  </span>
                  <ArrowUpRight
                    className="hidden size-5 justify-self-end transition-transform group-hover:rotate-45 md:block"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="turnos">
        <div className="flex items-end justify-between gap-6">
          <h2 id="turnos" className="display text-3xl md:text-4xl">
            Próximos turnos
          </h2>
          <Link href="/turnos" className="text-sm link-underline">
            Pedir turno
          </Link>
        </div>
        {!appointments || appointments.length === 0 ? (
          <p className="mt-6 text-muted-foreground">No tenés turnos próximos.</p>
        ) : (
          <ul className="mt-8 border-t border-border">
            {appointments.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border py-5"
              >
                <span className="text-lg">{formatDateTime(a.starts_at)}</span>
                <span className="text-sm text-muted-foreground">
                  {getService(a.area)?.title ?? a.area} · {a.mode} ·{" "}
                  {appointmentStatusLabel[a.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
