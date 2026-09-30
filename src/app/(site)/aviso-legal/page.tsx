import { ProsePage } from "@/components/sections/prose-page";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Aviso legal",
  description: "Condiciones de uso del sitio y alcance de la información publicada.",
  path: "/aviso-legal",
});

export default function LegalNoticePage() {
  return (
    <ProsePage eyebrow="Legal" title="Aviso legal" updated="29 de septiembre de 2026">
      <p>
        Este sitio es operado por {site.legalName} (Dra. Paula Florencia Sardo, CPACF T° 152 F° 256
        · CAAL T° V F° 69), con atención en {site.contact.location}. Contacto:{" "}
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> · WhatsApp{" "}
        {site.contact.phone}.
      </p>

      <h2>Alcance de la información</h2>
      <p>
        Los contenidos de este sitio, incluidos los artículos y las respuestas del asistente
        virtual, tienen carácter general e informativo. No constituyen asesoramiento legal ni
        generan una relación abogado-cliente. Cada caso requiere un análisis particular por parte de
        un profesional matriculado.
      </p>

      <h2>Relación profesional</h2>
      <p>
        La relación profesional con el Estudio comienza únicamente a partir de la aceptación expresa
        del caso y la conformidad sobre honorarios. El envío de un formulario, la reserva de un
        turno, el registro en el portal o el uso del asistente no crean por sí solos esa relación.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        Los textos, diseño y marca son propiedad del Estudio. Se permite citar contenidos
        mencionando la fuente.
      </p>

      <h2>Enlaces externos</h2>
      <p>
        El Estudio no se responsabiliza por el contenido de sitios de terceros enlazados desde este
        sitio (incluido WhatsApp u otras plataformas).
      </p>

      <h2>Jurisdicción</h2>
      <p>
        Para cualquier controversia relativa al uso de este sitio resultan aplicables las leyes de
        la República Argentina, con jurisdicción en los tribunales competentes de la Ciudad Autónoma
        de Buenos Aires o de la Provincia de Buenos Aires, según corresponda, sin perjuicio de los
        fueros especiales que pudieran corresponder.
      </p>
    </ProsePage>
  );
}
