import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHeader } from "@/components/sections/page-header";
import { team } from "@/content/site";
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

export default function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="Equipo"
        title={
          <>
            Las personas
            <br />
            <em>detrás de cada caso.</em>
          </>
        }
        lead="Un equipo especializado por área, con un abogado responsable y accesible para cada cliente."
      />

      <section aria-label="Integrantes" className="container-page">
        <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <Reveal as="li" key={member.name} delay={i * 0.08}>
              <div
                className="flex aspect-[4/5] items-end justify-start rounded-sm bg-secondary p-6 text-muted-foreground"
                aria-hidden="true"
              >
                <span className="display text-8xl opacity-40">{initials(member.name)}</span>
              </div>
              <h2 className="mt-6 font-serif text-3xl">{member.name}</h2>
              <p className="mt-1 text-sm text-brand">{member.role}</p>
              <p className="mt-4 text-muted-foreground">{member.bio}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Áreas">
                {member.areas.map((a) => (
                  <li key={a} className="rounded-full border border-border px-3 py-1 text-xs">
                    {a}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-xs text-muted-foreground">{member.registration}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <CtaBand />
    </>
  );
}
