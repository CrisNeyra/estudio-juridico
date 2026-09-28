import { CtaBand } from "@/components/sections/cta-band";
import { PageHeader } from "@/components/sections/page-header";
import { PageShell } from "@/components/sections/page-shell";
import { ServiceFinder } from "@/components/sections/service-finder";
import { ServicesIndex } from "@/components/sections/services-index";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Servicios y áreas de práctica",
  description:
    "Cinco áreas de práctica: laboral, familia, penal, civil y daños, y sucesiones. Atención en CABA y Provincia de Buenos Aires.",
  path: "/servicios",
});

export default function ServicesPage() {
  return (
    <PageShell photo="servicios">
      <PageHeader
        eyebrow="Áreas"
        title={
          <>
            Cinco áreas.
            <br />
            <em className="text-violet">Un mismo criterio.</em>
          </>
        }
        lead="Elegí el área o contanos tu situación con tus palabras: te indicamos por dónde empezar."
      >
        <div className="mt-12">
          <ServiceFinder />
        </div>
      </PageHeader>

      <section aria-label="Listado de áreas" className="container-page">
        <ServicesIndex headingLevel="h2" />
      </section>

      <CtaBand />
    </PageShell>
  );
}
