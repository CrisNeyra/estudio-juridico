import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { PageShell } from "@/components/sections/page-shell";
import { ServiceIcon } from "@/components/service-icon";
import { AskAssistantButton } from "@/components/ai/ask-assistant-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getService, processSteps, serviceNumber, services } from "@/content/services";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<"/servicios/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) return {};
  return pageMetadata({
    title: `Abogados de ${service.title}`,
    description: `${service.short} ${service.summary}`,
    path: `/servicios/${service.slug}`,
  });
}

export default async function ServicePage(props: PageProps<"/servicios/[slug]">) {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) notFound();

  const index = services.findIndex((s) => s.slug === slug);
  const prev = services[(index - 1 + services.length) % services.length]!;
  const next = services[(index + 1) % services.length]!;

  return (
    <PageShell photo={service.slug}>
      <JsonLd
        data={[
          serviceJsonLd(service),
          faqJsonLd(service.faqs),
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Servicios", path: "/servicios" },
            { name: service.title, path: `/servicios/${service.slug}` },
          ]),
        ]}
      />

      <section className="container-page pt-12 pb-16 md:pt-20 md:pb-24">
        <nav aria-label="Migas de pan" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/servicios" className="hover:text-foreground">
                Servicios
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {service.title}
            </li>
          </ol>
        </nav>

        <div className="mt-14 grid rise gap-10 md:grid-cols-12">
          <div className="md:col-span-9">
            <p className="eyebrow">Área {serviceNumber(service.slug)}</p>
            <h1 className="mt-6 display text-6xl md:text-9xl">{service.title}</h1>
            <p className="mt-8 max-w-2xl text-xl text-muted-foreground">{service.summary}</p>
          </div>
          <div className="hidden md:col-span-3 md:flex md:items-end md:justify-end">
            <ServiceIcon name={service.icon} className="size-40 text-brand" strokeWidth={0.6} />
          </div>
        </div>
      </section>

      <section aria-labelledby="casos" className="container-page grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 id="casos" className="display text-4xl md:text-5xl">
            En qué te ayudamos
          </h2>
        </div>
        <ul className="grid border-t border-border sm:grid-cols-2 md:col-span-8">
          {service.cases.map((c, i) => (
            <li
              key={c}
              className="flex items-baseline gap-4 border-b border-border py-5 sm:odd:pr-6"
            >
              <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-lg">{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="proceso"
        className="container-page mt-28 grid gap-12 md:grid-cols-12"
      >
        <div className="md:col-span-4">
          <h2 id="proceso" className="display text-4xl md:text-5xl">
            Cómo trabajamos
          </h2>
        </div>
        <ol className="grid gap-8 sm:grid-cols-2 md:col-span-8">
          {processSteps.map((step, i) => (
            <li key={step.title}>
              <span className="font-mono text-xs text-muted-foreground">Paso {i + 1}</span>
              <h3 className="mt-2 font-serif text-2xl">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq" className="container-page mt-28 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 id="faq" className="display text-4xl md:text-5xl">
            Preguntas frecuentes
          </h2>
          <div className="mt-6">
            <AskAssistantButton prompt={`Tengo una consulta sobre ${service.title}: `} />
          </div>
        </div>
        <Accordion type="single" collapsible className="border-t border-border md:col-span-8">
          {service.faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`faq-${i}`}>
              <AccordionTrigger className="py-6 font-serif text-xl hover:no-underline md:text-2xl">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <CtaBand title={`Consultá por ${service.title.toLowerCase()}`} />

      <nav
        aria-label="Otras áreas"
        className="container-page mt-16 flex justify-between gap-6 text-sm"
      >
        <Link
          href={`/servicios/${prev.slug}`}
          className="group flex items-center gap-3 hover:text-brand"
        >
          <ArrowLeft
            className="size-4 transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          {prev.title}
        </Link>
        <Link
          href={`/servicios/${next.slug}`}
          className="group flex items-center gap-3 text-right hover:text-brand"
        >
          {next.title}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </nav>
    </PageShell>
  );
}
