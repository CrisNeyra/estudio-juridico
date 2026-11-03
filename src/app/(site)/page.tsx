import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { HeroVideo } from "@/components/sections/hero-video";
import { ServiceFinder } from "@/components/sections/service-finder";
import { ServicesIndex } from "@/components/sections/services-index";
import { processSteps } from "@/content/services";
import { site, stats, values } from "@/content/site";
import { legalServiceJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd data={legalServiceJsonLd()} />

      <section className="relative flex min-h-[calc(100dvh-5rem)] flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <HeroVideo />
          <div className="absolute inset-0 bg-white/40" />
        </div>
        <div className="container-page flex min-h-[calc(100dvh-5rem)] flex-col justify-between pt-28 pb-28 md:pt-40 md:pb-16 lg:pt-48">
          <div className="max-w-4xl rise">
            <p className="eyebrow">
              {site.tagline} {site.name} - CABA y Provincia de Buenos Aires
            </p>
            <h1 className="mt-4 display text-[clamp(2rem,5.2vw,4.5rem)]">
              Tu tranquilidad, respaldada por la
              <br />
              <em className="whitespace-nowrap text-violet">mejor defensa legal.</em>
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/turnos"
                className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 py-2.5 text-base text-background transition-colors duration-300 hover:bg-brand hover:text-brand-foreground"
              >
                Pedir turno
              </Link>
              <a
                href={`https://wa.me/${site.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-foreground bg-background/80 px-5 py-2.5 text-base backdrop-blur-sm transition-colors hover:border-brand hover:text-brand"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-auto grid items-end gap-8 pt-10 md:grid-cols-12">
            <div className="rise [animation-delay:100ms] md:col-span-7">
              <ServiceFinder />
            </div>
            <div className="max-w-sm rise [animation-delay:200ms] md:col-span-4 md:col-start-8 md:max-w-none md:pr-24 lg:pr-28">
              <p className="text-lg font-medium text-ink">
                Asesoramiento jurídico integral, acompañamiento profesional y defensa de{" "}
                <strong className="font-semibold">tus derechos</strong>.
              </p>
              <Link
                href="/estudio"
                className="mt-6 inline-block font-medium text-ink link-underline"
              >
                Conocé el estudio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div
        className="relative section-photo"
        style={{ "--section-photo": 'url("/images/fondos/home-seccion.jpg")' } as CSSProperties}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/50 to-transparent"
          aria-hidden="true"
        />
        <section aria-labelledby="areas" className="relative container-page pt-28 md:pt-40">
          <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
            <div>
              <p className="eyebrow">Áreas de práctica</p>
              <h2 id="areas" className="mt-4 display text-4xl md:text-6xl">
                Qué resolvemos
              </h2>
            </div>
            <Link
              href="/servicios"
              className="hidden items-center gap-2 text-sm text-muted-foreground hover:text-foreground md:inline-flex"
            >
              Ver todos los servicios <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ServicesIndex />
        </section>

        <section aria-label="El estudio en números" className="container-page mt-32">
          <dl className="grid grid-cols-1 gap-y-12 sm:grid-cols-3">
            {stats.map((s, i) => (
              <Reveal
                key={s.label}
                delay={i * 0.08}
                className="flex flex-col border-l border-border pl-6"
              >
                <dt className="text-sm text-muted-foreground">{s.label}</dt>
                <dd className="order-first display text-6xl md:text-7xl">{s.value}</dd>
              </Reveal>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="proceso"
          className="container-page mt-32 grid gap-12 md:grid-cols-12"
        >
          <div className="md:col-span-4">
            <p className="eyebrow">Cómo trabajamos</p>
            <h2 id="proceso" className="mt-4 display text-4xl md:text-6xl">
              Cuatro pasos, <em>sin sorpresas</em>
            </h2>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-sm md:col-span-8 md:grid-cols-2">
            {processSteps.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={i * 0.08}
                className="bg-secondary p-8 md:p-10"
              >
                <span className="font-mono text-xs text-brand">0{i + 1}</span>
                <h3 className="mt-6 font-serif text-3xl">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section aria-labelledby="valores" className="container-page mt-32">
          <p className="eyebrow">Nuestro criterio</p>
          <h2 id="valores" className="sr-only">
            Valores
          </h2>
          <div className="mt-10 grid gap-12 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <h3 className="display text-5xl">{v.title}</h3>
                <p className="mt-4 text-lg text-muted-foreground">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      <CtaBand />
    </>
  );
}
