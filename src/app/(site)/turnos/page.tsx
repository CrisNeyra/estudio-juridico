import { connection } from "next/server";
import { BookingForm } from "@/components/forms/booking-form";
import { PageHeader } from "@/components/sections/page-header";
import { getService } from "@/content/services";
import { site } from "@/content/site";
import { bookingRange } from "@/lib/schedule";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pedir turno",
  description: "Reservá una consulta presencial o por videollamada con el estudio en pocos pasos.",
  path: "/turnos",
});

export default async function BookingPage(props: PageProps<"/turnos">) {
  await connection();
  const { area } = await props.searchParams;
  const defaultArea = typeof area === "string" && getService(area) ? area : undefined;
  const { min, max } = bookingRange(new Date());

  return (
    <>
      <PageHeader
        eyebrow="Turnos"
        title={
          <>
            Reservá
            <br />
            <em>tu consulta.</em>
          </>
        }
        lead="Elegí área, día y horario. Presencial en nuestra oficina o por videollamada."
      />
      <section className="container-page grid gap-16 md:grid-cols-12">
        <div className="md:col-span-8">
          <BookingForm minDate={min} maxDate={max} defaultArea={defaultArea} />
        </div>
        <aside
          className="space-y-6 text-muted-foreground md:col-span-3 md:col-start-10"
          aria-label="Información del turno"
        >
          <div>
            <p className="eyebrow">Duración</p>
            <p className="mt-2 text-lg text-foreground">60 minutos</p>
          </div>
          <div>
            <p className="eyebrow">Dirección</p>
            <p className="mt-2 text-lg text-foreground">
              {site.contact.address.street}
              <br />
              {site.contact.address.city}
            </p>
          </div>
          <p className="border-t border-border pt-6 text-sm">
            Traé o tené a mano la documentación relacionada con tu consulta. Si necesitás cancelar,
            avisanos con 24 horas de anticipación.
          </p>
        </aside>
      </section>
    </>
  );
}
