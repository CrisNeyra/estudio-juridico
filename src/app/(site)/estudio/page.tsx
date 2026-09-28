import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHeader } from "@/components/sections/page-header";
import { PageShell } from "@/components/sections/page-shell";
import { site, stats, values } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "El estudio",
  description: `Conocé ${site.legalName}: trayectoria, forma de trabajo y compromiso con cada cliente.`,
  path: "/estudio",
});

export default function StudioPage() {
  return (
    <PageShell photo="estudio">
      <PageHeader
        eyebrow="El estudio"
        title={
          <>
            Abogacía cercana,
            <br />
            <em>rigurosa y sin vueltas.</em>
          </>
        }
        lead="Asesoramiento jurídico integral, acompañamiento profesional y defensa de tus derechos, con atención personalizada en CABA y en la Provincia de Buenos Aires."
      />

      <section className="container-page grid gap-12 md:grid-cols-12">
        <Reveal className="space-y-6 text-lg md:col-span-6 md:col-start-4">
          <p>
            El estudio de la Dra. Paula Florencia Sardo acompaña a personas que necesitan entender
            su situación y defender sus derechos, con un trato cercano y profesional.
          </p>
          <p className="text-muted-foreground">
            La práctica abarca derecho laboral, familia, penal, civil y daños, y sucesiones. La
            atención es personalizada, en la Ciudad Autónoma de Buenos Aires y en la Provincia de
            Buenos Aires.
          </p>
          <p className="text-muted-foreground">
            Priorizamos explicarte las opciones con claridad y avanzar por el camino que mejor
            resguarde tus derechos.
          </p>
        </Reveal>
      </section>

      <section aria-label="Trayectoria" className="container-page mt-28">
        <dl className="grid grid-cols-1 border-t border-border sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col border-b border-border py-8 md:border-b-0">
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="order-first display text-6xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="valores" className="container-page mt-28">
        <h2 id="valores" className="display text-4xl md:text-6xl">
          Lo que nos define
        </h2>
        <div className="mt-12 grid gap-12 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1} className="border-t border-border pt-6">
              <h3 className="font-serif text-3xl">{v.title}</h3>
              <p className="mt-3 text-muted-foreground">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand />
    </PageShell>
  );
}
