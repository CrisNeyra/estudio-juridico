import Link from "next/link";
import { asc, desc, gte } from "drizzle-orm";
import { NotConfigured } from "@/components/portal/not-configured";
import { CreateCaseForm, InviteUserForm } from "@/components/portal/admin-forms";
import { getService } from "@/content/services";
import { getAuthContext, requireStaff } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { appointmentStatusLabel, caseStatusLabel, formatDateTime, formatDay } from "@/lib/portal";
import { updateAppointmentStatus } from "./actions";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export default async function AdminPage() {
  const ctx = await getAuthContext();
  if (!ctx.configured) return <NotConfigured />;
  const staff = await requireStaff();
  const db = getDb()!;

  const since = hoursAgo(24);
  const [appointments, cases] = await Promise.all([
    db
      .select()
      .from(schema.appointments)
      .where(gte(schema.appointments.startsAt, since))
      .orderBy(asc(schema.appointments.startsAt))
      .limit(50),
    db.select().from(schema.cases).orderBy(desc(schema.cases.updatedAt)).limit(50),
  ]);

  return (
    <div className="space-y-24">
      <header>
        <p className="eyebrow">Administración</p>
        <h1 className="mt-6 display text-5xl md:text-7xl">Panel del estudio</h1>
      </header>

      <section aria-labelledby="turnos">
        <h2 id="turnos" className="display text-3xl md:text-4xl">
          Próximos turnos
        </h2>
        {appointments.length === 0 ? (
          <p className="mt-6 text-muted-foreground">No hay turnos próximos.</p>
        ) : (
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {appointments.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-serif text-2xl">{formatDateTime(a.startsAt.toISOString())}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{a.mode}</p>
                  <p className="mt-3">{a.name}</p>
                  <p className="text-sm text-muted-foreground">
                    <a href={`mailto:${a.email}`} className="hover:text-foreground">
                      {a.email}
                    </a>{" "}
                    · {a.phone}
                  </p>
                  <p className="mt-2 text-sm">
                    {getService(a.area)?.title ?? a.area} · {appointmentStatusLabel[a.status]}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {a.status !== "confirmado" ? (
                    <form action={updateAppointmentStatus}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value="confirmado" />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm text-background"
                      >
                        Confirmar
                      </button>
                    </form>
                  ) : null}
                  {a.status !== "cancelado" ? (
                    <form action={updateAppointmentStatus}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value="cancelado" />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm hover:border-destructive hover:text-destructive"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="casos">
        <h2 id="casos" className="display text-3xl md:text-4xl">
          Casos
        </h2>
        {cases.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Todavía no hay casos.</p>
        ) : (
          <ul className="mt-8 border-t border-border">
            {cases.map((c) => (
              <li key={c.id} className="border-b border-border">
                <Link
                  href={`/admin/casos/${c.id}`}
                  className="group flex flex-wrap items-baseline justify-between gap-4 py-5"
                >
                  <span className="font-serif text-xl transition-colors group-hover:text-brand">
                    {c.title}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getService(c.area)?.title ?? c.area} · {caseStatusLabel[c.status]} ·{" "}
                    {formatDay(c.updatedAt.toISOString())}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="invitar">
        <h2 id="invitar" className="mb-8 display text-3xl md:text-4xl">
          Invitar usuario
        </h2>
        <InviteUserForm allowStaffRoles={staff.profile.role === "admin"} />
      </section>

      <section aria-labelledby="nuevo">
        <h2 id="nuevo" className="mb-8 display text-3xl md:text-4xl">
          Nuevo caso
        </h2>
        <CreateCaseForm />
      </section>
    </div>
  );
}
