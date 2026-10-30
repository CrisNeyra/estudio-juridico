import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHeader } from "@/components/sections/page-header";
import { PageShell } from "@/components/sections/page-shell";
import { team } from "@/content/site";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Equipo",
  description: "Conocé a los abogados y abogadas del estudio y sus áreas de especialización.",
  path: "/equipo",
});

function initials(name: string) {
  return name
    .replace(/^Dr[a]?\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .join("");
}

function portraitSrc(image?: string) {
  if (!image?.startsWith("/")) return null;
  const file = path.join(process.cwd(), "public", image.slice(1));
  return existsSync(file) ? image : null;
}

function Portrait({ name, image }: { name: string; image: string | null }) {
  if (!image) {
    return (
      <div
        className="flex aspect-[4/5] items-end justify-start rounded-sm bg-secondary p-6 text-muted-foreground"
        aria-hidden="true"
      >
        <span className="display text-8xl opacity-40">{initials(name)}</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
      <Image
        src={image}
        alt={name}
        fill
        priority
        className="object-cover object-[center_18%]"
        sizes="(min-width: 640px) 50vw, 100vw"
      />
    </div>
  );
}

export default function TeamPage() {
  return (
    <PageShell photo="equipo">
      <PageHeader
        eyebrow="Equipo"
        title={
          <>
            Las personas
            <br />
            <em>detrás de cada caso.</em>
          </>
        }
        lead="Dra. Paula Florencia Sardo y asociadxs. Atención personalizada en CABA y en la Provincia de Buenos Aires."
      />

      <section aria-label="Integrantes" className="container-page">
        <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:max-w-xl">
          {team.map((member, i) => (
            <Reveal as="li" key={member.name} delay={i * 0.08}>
              <Portrait name={member.name} image={portraitSrc(member.image)} />
              <h2 className="mt-6 font-serif text-3xl">{member.name}</h2>
              <p className="mt-1 text-sm text-brand">{member.role}</p>
              <p className="mt-4 text-muted-foreground">{member.bio}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Áreas">
                {member.areas.map((a) => {
                  const service = services.find((s) => s.title === a || s.title.startsWith(a));
                  const className =
                    "inline-flex min-h-11 items-center rounded-full border border-border px-3 text-xs hover:border-brand hover:text-brand";
                  return (
                    <li key={a}>
                      {service ? (
                        <Link href={`/servicios/${service.slug}`} className={className}>
                          {a}
                        </Link>
                      ) : (
                        <span className={className}>{a}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 font-mono text-xs text-muted-foreground">{member.registration}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <CtaBand />
    </PageShell>
  );
}
