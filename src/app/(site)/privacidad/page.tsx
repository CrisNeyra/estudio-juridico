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
    <ProsePage eyebrow="Legal" title="Política de privacidad" updated="28 de septiembre de 2026">
      <p>
        {site.legalName} (en adelante, &quot;el Estudio&quot;), con atención en{" "}
        {site.contact.location}, trata los datos personales que nos facilitás conforme a la Ley
        25.326 de Protección de los Datos Personales y su normativa complementaria. Responsable del
        tratamiento: Dra. Paula Florencia Sardo. Contacto:{" "}
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
      </p>

      <h2>Qué datos recopilamos</h2>
      <ul>
        <li>Datos de contacto que ingresás en formularios: nombre, email, teléfono.</li>
        <li>La descripción de tu consulta y el área de interés.</li>
        <li>Datos de turnos: fecha, horario y modalidad elegida.</li>
        <li>
          Si usás el portal de clientes: datos de cuenta, casos y documentos que el Estudio cargue o
          comparta con vos.
        </li>
        <li>
          Datos técnicos anónimos de navegación y rendimiento (Vercel Analytics / Speed Insights),
          sin cookies publicitarias.
        </li>
      </ul>

      <h2>Para qué los usamos</h2>
      <p>
        Exclusivamente para responder tu consulta, gestionar turnos, contactarte por email o
        WhatsApp cuando lo solicites, y, si sos cliente, prestar el servicio profesional contratado.
        No vendemos ni cedemos tus datos a terceros con fines comerciales.
      </p>

      <h2>Asistente virtual</h2>
      <p>
        El asistente virtual puede utilizar un proveedor de inteligencia artificial (Google Gemini)
        para generar respuestas orientativas. Te pedimos no ingresar datos sensibles (salud, datos
        de terceros, números de documento o expedientes). Las conversaciones no se almacenan como
        expediente del Estudio. Sus respuestas no constituyen asesoramiento legal.
      </p>

      <h2>Proveedores</h2>
      <p>
        Para operar el sitio podemos usar servicios de hosting, correo, base de datos, limitación de
        abuso y, si está activado, el asistente de IA. Esos proveedores tratan datos solo en la
        medida necesaria para prestar el servicio y bajo sus propias políticas de privacidad.
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
        {site.contact.phone}. La Agencia de Acceso a la Información Pública, en su carácter de
        Órgano de Control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos
        que se interpongan con relación al incumplimiento de las normas sobre protección de datos
        personales.
      </p>

      <h2>Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables: cifrado en tránsito (HTTPS), control
        de accesos y almacenamiento en proveedores con estándares de seguridad reconocidos.
      </p>
    </ProsePage>
  );
}
