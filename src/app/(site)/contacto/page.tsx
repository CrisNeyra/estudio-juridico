import { ContactForm } from "@/components/forms/contact-form";
import { PageHeader } from "@/components/sections/page-header";
import { PageShell } from "@/components/sections/page-shell";
import { getService } from "@/content/services";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contacto",
  description: `Escribinos tu consulta. Atención personalizada en ${site.contact.location}.`,
  path: "/contacto",
});

export default async function ContactPage(props: PageProps<"/contacto">) {
  const { area } = await props.searchParams;
  const defaultArea = typeof area === "string" && getService(area) ? area : undefined;
  const { contact } = site;

  return (
    <PageShell photo="contacto">
      <PageHeader
        eyebrow="Contacto"
        title={
          <>
            Contanos
            <br />
            <em>tu situación.</em>
          </>
        }
        lead="Contanos tu situación. Te orientamos sobre el área que corresponde y los próximos pasos."
      />

      <section className="container-page grid gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <ContactForm defaultArea={defaultArea} />
        </div>

        <aside className="space-y-10 md:col-span-4 md:col-start-9" aria-label="Datos de contacto">
          <div>
            <p className="eyebrow">Teléfono</p>
            <a href={contact.phoneHref} className="mt-2 block font-serif text-3xl hover:text-brand">
              {contact.phone}
            </a>
          </div>
          <div>
            <p className="eyebrow">WhatsApp</p>
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block font-serif text-3xl hover:text-brand"
            >
              Escribinos
            </a>
          </div>
          <div>
            <p className="eyebrow">Email</p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-2 block text-lg break-all link-underline"
            >
              {contact.email}
            </a>
          </div>
          <address className="not-italic">
            <p className="eyebrow">Atención</p>
            <p className="mt-2 text-lg">{contact.location}</p>
          </address>
        </aside>
      </section>
    </PageShell>
  );
}
