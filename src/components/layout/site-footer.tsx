import Link from "next/link";
import { services } from "@/content/services";
import { navigation, site } from "@/content/site";

export function SiteFooter() {
  const { contact } = site;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-border">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="display text-4xl">{site.name}</p>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{site.description}</p>
        </div>

        <nav aria-label="Áreas de práctica" className="md:col-span-4">
          <p className="mb-4 eyebrow">Áreas</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/servicios/${s.slug}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm md:col-span-2">
          <p className="mb-4 eyebrow">Estudio</p>
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/portal" className="text-muted-foreground hover:text-foreground">
                Portal de clientes
              </Link>
            </li>
          </ul>
        </div>

        <address className="text-sm not-italic md:col-span-2">
          <p className="mb-4 eyebrow">Contacto</p>
          <p className="text-muted-foreground">
            {contact.address.street}
            <br />
            {contact.address.city}
          </p>
          <p className="mt-3">
            <a href={contact.phoneHref} className="link-underline">
              {contact.phone}
            </a>
          </p>
          <p className="mt-1">
            <a href={`mailto:${contact.email}`} className="break-all link-underline">
              {contact.email}
            </a>
          </p>
          <p className="mt-3 text-muted-foreground">{contact.hours}</p>
        </address>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.legalName}. La información de este sitio es general y no constituye
            asesoramiento legal.
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacidad" className="hover:text-foreground">
                Privacidad
              </Link>
            </li>
            <li>
              <Link href="/aviso-legal" className="hover:text-foreground">
                Aviso legal
              </Link>
            </li>
            <li>
              <a
                href={site.social.linkedin}
                className="hover:text-foreground"
                rel="noopener noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={site.social.instagram}
                className="hover:text-foreground"
                rel="noopener noreferrer"
                target="_blank"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
