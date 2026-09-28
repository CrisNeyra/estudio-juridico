import type { Metadata } from "next";
import type { Faq, Service } from "@/content/services";
import { site, team } from "@/content/site";

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
      type: "website",
      locale: site.locale,
      siteName: site.legalName,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

type JsonLd = Record<string, unknown>;

export function legalServiceJsonLd(): JsonLd {
  const { contact } = site;
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": absoluteUrl("/#organization"),
    name: site.legalName,
    description: site.description,
    url: site.url,
    email: contact.email,
    telephone: contact.phone,
    areaServed: [
      { "@type": "AdministrativeArea", name: "Ciudad Autónoma de Buenos Aires" },
      { "@type": "AdministrativeArea", name: "Provincia de Buenos Aires" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ciudad Autónoma de Buenos Aires",
      addressRegion: "Buenos Aires",
      addressCountry: "AR",
    },
    employee: team.map((m) => ({
      "@type": "Attorney",
      name: m.name,
      jobTitle: m.role,
      knowsAbout: m.areas,
    })),
  };
}

export function serviceJsonLd(service: Service): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.title,
    name: `${service.title} | ${site.name}`,
    description: service.summary,
    url: absoluteUrl(`/servicios/${service.slug}`),
    provider: { "@id": absoluteUrl("/#organization") },
    areaServed: { "@type": "Country", name: "Argentina" },
  };
}

export function faqJsonLd(faqs: Faq[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Serializes JSON-LD safely for inline <script>, escaping `<` to prevent tag breakout. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
