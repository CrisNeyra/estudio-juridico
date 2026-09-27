import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/content/site";

export function CtaBand({
  title = "¿Tenés una consulta?",
  text = "Contanos tu situación. Te respondemos en menos de 24 horas hábiles con una primera orientación.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="container-page mt-32">
      <Reveal className="relative overflow-hidden rounded-sm bg-foreground px-6 py-16 text-background md:px-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <h2 className="display text-5xl md:text-7xl">{title}</h2>
            <p className="mt-6 max-w-xl text-lg opacity-80">{text}</p>
          </div>
          <div className="flex flex-col gap-3 md:col-span-5 md:items-end">
            <Link
              href="/turnos"
              className="group inline-flex items-center justify-between gap-6 rounded-full bg-background px-7 py-4 text-base text-foreground transition-transform hover:-translate-y-0.5"
            >
              Pedir turno
              <ArrowUpRight
                className="size-5 transition-transform group-hover:rotate-45"
                aria-hidden="true"
              />
            </Link>
            <a
              href={`https://wa.me/${site.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between gap-6 rounded-full border border-background/30 px-7 py-4 text-base transition-colors hover:border-background"
            >
              Escribir por WhatsApp
              <ArrowUpRight className="size-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
