import { ProsePage } from "@/components/sections/prose-page";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Política de privacidad",
  description: "Cómo tratamos y protegemos tus datos personales conforme a la Ley 25.326.",
  path: "/privacidad",
});

export default function PrivacyPage() {
  return (
    <ProsePage eyebrow="Legal" title="Política de privacidad" updated="29 de septiembre de 2026">
      <p>
        {site.legalName} (en adelante, &quot;el Estudio&quot;), con atención en{" "}
        {site.contact.location}, trata los datos personales que nos facilitás conforme a la Ley
        25.326 de Protección de los Datos Personales y su normativa complementaria. Responsable del
        tratamiento: Dra. Paula Florencia Sardo. Contacto para ejercer derechos:{" "}
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
      </p>

      <h2>Qué datos recopilamos</h2>
      <ul>
        <li>
          Datos de contacto que ingresás en formularios: nombre, email y, si lo indicás, teléfono.
          Son necesarios para poder responderte o agendar; si no los facilitás, no podemos dar curso
          a la solicitud.
        </li>
        <li>
          La descripción de tu consulta y el área de interés (voluntarios en su contenido, pero
          necesarios para orientarte).
        </li>
        <li>Datos de turnos: fecha, horario y modalidad elegida.</li>
        <li>
          Si usás el portal de clientes (acceso por invitación del Estudio): datos de cuenta, casos,
          eventos y documentos que el Estudio cargue o comparta con vos.
        </li>
        <li>
          Datos técnicos de navegación y rendimiento (Vercel Analytics / Speed Insights), sin
          cookies publicitarias ni seguimiento con fines de marketing.
        </li>
        <li>
          Señales anti-abuso en formularios (Cloudflare Turnstile), para distinguir personas de
          bots.
        </li>
      </ul>

      <h2>Para qué los usamos</h2>
      <p>
        Exclusivamente para responder tu consulta, gestionar turnos, contactarte por email o
        WhatsApp cuando lo solicites, prestar el servicio profesional si sos cliente, y operar el
        sitio de forma segura. No vendemos tus datos ni los cedemos a terceros con fines
        comerciales. Los destinatarios son el equipo del Estudio y los proveedores técnicos
        indispensables listados más abajo, solo en la medida necesaria para cada servicio.
      </p>

      <h2>Asistente virtual</h2>
      <p>
        El asistente virtual puede utilizar un proveedor de inteligencia artificial (Google Gemini)
        para generar respuestas orientativas de carácter general. Te pedimos no ingresar datos
        sensibles (salud, orientación sexual, datos biométricos, datos de terceros, números de
        documento o expedientes). Las conversaciones no se almacenan como expediente del Estudio.
        Sus respuestas no constituyen asesoramiento legal ni crean relación abogado-cliente.
      </p>

      <h2>WhatsApp y canales externos</h2>
      <p>
        Si nos escribís por WhatsApp u otra plataforma de terceros, además de esta política aplican
        los términos y la política de privacidad de ese proveedor (por ejemplo, Meta Platforms).
        Preferí no enviar por esos canales información innecesariamente sensible.
      </p>

      <h2>Portal de clientes</h2>
      <p>
        El acceso al portal lo habilita el Estudio por invitación. Los documentos del caso los carga
        el equipo; vos podés consultar lo que se comparta con tu cuenta. El personal del Estudio
        accede con controles de acceso y, para roles de equipo, autenticación de doble factor. Podés
        pedir rectificación o baja escribiendo al email de contacto indicado arriba.
      </p>

      <h2>Proveedores</h2>
      <p>
        Para operar el sitio usamos encargados técnicos que tratan datos solo para prestar el
        servicio, bajo sus propias políticas:
      </p>
      <ul>
        <li>Vercel: hosting del sitio y métricas de uso/rendimiento.</li>
        <li>Gmail / Resend: envío de correos transaccionales (consultas y avisos de turnos).</li>
        <li>
          Neon: base de datos del portal y turnos. Autenticación con Auth.js en este sitio.
          Documentos del portal en Vercel Blob (acceso solo autenticado).
        </li>
        <li>Cloudflare Turnstile: verificación anti-bots en formularios.</li>
        <li>Google Gemini: generación de respuestas del asistente virtual, cuando está activo.</li>
      </ul>
      <p>
        Algunos de estos proveedores pueden tratar datos fuera de la República Argentina. Al usar el
        sitio y enviar formularios, aceptás ese tratamiento en la medida necesaria para el servicio.
      </p>

      <h2>Conservación</h2>
      <ul>
        <li>
          Consultas web que no se convierten en relación profesional: hasta 12 meses, salvo que
          pidas su eliminación antes o exista una razón legítima para conservarlas.
        </li>
        <li>Turnos no confirmados o cancelados: hasta 6 meses.</li>
        <li>
          Datos de clientes, casos y documentos: mientras dure el vínculo profesional y el tiempo
          adicional que exijan obligaciones legales o el archivo profesional del Estudio.
        </li>
        <li>Métricas técnicas: según las políticas de retención del proveedor de analytics.</li>
      </ul>

      <h2>Datos sensibles y menores</h2>
      <p>
        No solicitamos deliberadamente datos sensibles ni de menores de edad a través del sitio. Si
        los recibimos por error, los trataremos con reserva profesional y podremos pedirte que no
        los reenvíes por canales inseguros. Este sitio no está dirigido a menores; si detectamos un
        uso por parte de un menor, no daremos curso a la solicitud sin intervención de un adulto
        responsable.
      </p>

      <h2>Secreto profesional</h2>
      <p>
        Toda la información que compartas con el Estudio en el marco de una consulta profesional
        está amparada por el secreto profesional.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Podés ejercer los derechos de acceso, rectificación, actualización y supresión escribiendo a{" "}
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> o por WhatsApp al{" "}
        {site.contact.phone}, acreditando tu identidad. La Agencia de Acceso a la Información
        Pública (AAIP), en su carácter de Órgano de Control de la Ley 25.326, tiene la atribución de
        atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las
        normas sobre protección de datos personales.
      </p>

      <h2>Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables: cifrado en tránsito (HTTPS), control
        de accesos (incluido doble factor para el equipo en el portal) y almacenamiento en
        proveedores con estándares de seguridad reconocidos.
      </p>
    </ProsePage>
  );
}
