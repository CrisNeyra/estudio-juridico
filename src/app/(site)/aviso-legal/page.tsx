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
    <ProsePage eyebrow="Legal" title="Aviso legal" updated="27 de septiembre de 2026">
      <p>
        Este sitio es operado por {site.legalName}, con atención en {site.contact.location}. Este
        texto es un modelo y debe ser revisado por el Estudio antes de su publicación.
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
        del caso y la conformidad sobre honorarios.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        Los textos, diseño y marca son propiedad del Estudio. Se permite citar contenidos
        mencionando la fuente.
      </p>

      <h2>Enlaces externos</h2>
      <p>
        El Estudio no se responsabiliza por el contenido de sitios de terceros enlazados desde este
        sitio.
      </p>
    </ProsePage>
  );
}
