import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { NotConfigured } from "@/components/portal/not-configured";
import { getService } from "@/content/services";
import { getAuthContext, requireUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { appointmentStatusLabel, caseStatusLabel, formatDateTime, formatDay } from "@/lib/portal";

export default async function PortalHome() {
  const ctx = await getAuthContext();
  if (!ctx.configured) return <NotConfigured />;

  const { profile } = await requireUser();
  const db = getDb()!;

  const [cases, appointments] = await Promise.all([
    db
      .select({
        id: schema.cases.id,
        title: schema.cases.title,
        area: schema.cases.area,
        reference: schema.cases.reference,
        status: schema.cases.status,
        updatedAt: schema.cases.updatedAt,
        clientId: schema.cases.clientId,
      })
      .from(schema.cases)
      .where(eq(schema.cases.clientId, profile.id))
      .orderBy(desc(schema.cases.updatedAt)),
    db
      .select({
        id: schema.appointments.id,
        name: schema.appointments.name,
        email: schema.appointments.email,
        phone: schema.appointments.phone,
        area: schema.appointments.area,
        startsAt: schema.appointments.startsAt,
        mode: schema.appointments.mode,
        notes: schema.appointments.notes,
        status: schema.appointments.status,
      })
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.clientId, profile.id),
          gte(schema.appointments.startsAt, new Date()),
        ),
      )
      .orderBy(asc(schema.appointments.startsAt)),
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
        {cases.length === 0 ? (
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
                    {getService(c.area)?.title ?? c.area} · act.{" "}
                    {formatDay(c.updatedAt.toISOString())}
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
        <h2 id="turnos" className="display text-3xl md:text-4xl">
          Próximos turnos
        </h2>
        {appointments.length === 0 ? (
          <p className="mt-6 text-muted-foreground">No tenés turnos próximos.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {appointments.map((a) => (
              <li key={a.id} className="border-b border-border py-4">
                <p className="font-serif text-xl">{formatDateTime(a.startsAt.toISOString())}</p>
                <p className="text-sm text-muted-foreground">
                  {getService(a.area)?.title ?? a.area} · {a.mode} ·{" "}
                  {appointmentStatusLabel[a.status]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
