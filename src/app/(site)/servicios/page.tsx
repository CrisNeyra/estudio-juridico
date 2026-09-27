import { CtaBand } from "@/components/sections/cta-band";
import { PageHeader } from "@/components/sections/page-header";
import { ServiceFinder } from "@/components/sections/service-finder";
import { ServicesIndex } from "@/components/sections/services-index";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Servicios y áreas de práctica",
  description:
    "Diez áreas de práctica: civil, familia y sucesiones, laboral, penal, comercial, inmobiliario, previsional, daños, consumidor y tributario.",
  path: "/servicios",
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Servicios"
        title={
          <>
            Diez áreas.
            <br />
            <em>Un mismo criterio.</em>
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
    </>
  );
}
