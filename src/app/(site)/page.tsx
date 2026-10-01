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
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/25 to-white/40" />
        </div>
        <div className="container-page flex min-h-[calc(100dvh-5rem)] flex-col justify-between pt-8 pb-8 md:pt-10 md:pb-10">
          <div className="rise">
            <p className="eyebrow">{site.tagline} — CABA y Provincia de Buenos Aires</p>
            <h1 className="mt-4 display text-[clamp(2rem,5.2vw,4.5rem)]">
              Tu tranquilidad,
              <br />
              respaldada por la <em className="text-violet">mejor defensa legal.</em>
            </h1>
          </div>

          <div className="mt-auto grid items-end gap-8 pt-10 md:grid-cols-12">
            <div className="rise [animation-delay:100ms] md:col-span-7">
              <ServiceFinder />
            </div>
            <div className="rise [animation-delay:200ms] md:col-span-4 md:col-start-9">
              <p className="text-lg text-muted-foreground">
                Asesoramiento jurídico integral, acompañamiento profesional y defensa de{" "}
                <strong className="font-semibold text-foreground">tus derechos</strong>.
              </p>
              <Link href="/estudio" className="mt-6 inline-block link-underline">
                Conocé el estudio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div
        className="section-photo"
        style={{ "--section-photo": 'url("/images/fondos/home-seccion.jpg")' } as CSSProperties}
      >
        <section aria-labelledby="areas" className="container-page">
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
