import Link from "next/link";
import { NotConfigured } from "@/components/portal/not-configured";
import { CreateCaseForm } from "@/components/portal/admin-forms";
import { getService } from "@/content/services";
import { getAuthContext, requireStaff } from "@/lib/auth";
import {
  appointmentStatusLabel,
  caseStatusLabel,
  formatDateTime,
  formatDay,
  type AppointmentRow,
  type CaseRow,
} from "@/lib/portal";
import { updateAppointmentStatus } from "./actions";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export default async function AdminPage() {
  const ctx = await getAuthContext();
  if (!ctx.configured) return <NotConfigured />;
  const { supabase } = await requireStaff();

  const since = hoursAgo(24);
  const [{ data: appointments }, { data: cases }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, name, email, phone, area, starts_at, mode, notes, status")
      .gte("starts_at", since)
      .order("starts_at")
      .limit(50)
      .returns<AppointmentRow[]>(),
    supabase
      .from("cases")
      .select("id, title, area, reference, status, updated_at, client_id")
      .order("updated_at", { ascending: false })
      .limit(50)
      .returns<CaseRow[]>(),
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
        {!appointments || appointments.length === 0 ? (
          <p className="mt-6 text-muted-foreground">No hay turnos próximos.</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th scope="col" className="py-3 font-normal">
                    Fecha
                  </th>
                  <th scope="col" className="py-3 font-normal">
                    Cliente
                  </th>
                  <th scope="col" className="py-3 font-normal">
                    Área
                  </th>
                  <th scope="col" className="py-3 font-normal">
                    Estado
                  </th>
                  <th scope="col" className="py-3 font-normal">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-border align-top">
                    <td className="py-4 pr-4">
                      {formatDateTime(a.starts_at)}
                      <span className="block text-xs text-muted-foreground">{a.mode}</span>
                    </td>
                    <td className="py-4 pr-4">
                      {a.name}
                      <span className="block text-xs text-muted-foreground">
                        <a href={`mailto:${a.email}`} className="hover:text-foreground">
                          {a.email}
                        </a>{" "}
                        · {a.phone}
                      </span>
                      {a.notes ? (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          “{a.notes}”
                        </span>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4">{getService(a.area)?.title ?? a.area}</td>
                    <td className="py-4 pr-4">{appointmentStatusLabel[a.status]}</td>
                    <td className="py-4">
                      <div className="flex justify-end gap-3">
                        {a.status !== "confirmado" ? (
                          <form action={updateAppointmentStatus}>
                            <input type="hidden" name="id" value={a.id} />
                            <input type="hidden" name="status" value="confirmado" />
                            <button type="submit" className="link-underline">
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
                              className="text-muted-foreground hover:text-destructive"
                            >
                              Cancelar
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="casos">
        <h2 id="casos" className="display text-3xl md:text-4xl">
          Casos
        </h2>
        {!cases || cases.length === 0 ? (
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
                    {formatDay(c.updated_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
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
