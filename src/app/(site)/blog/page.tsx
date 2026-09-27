import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/sections/page-header";
import { getService } from "@/content/services";
import { formatDate, getAllPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Novedades jurídicas",
  description:
    "Artículos breves y claros sobre temas legales frecuentes, escritos por el equipo del estudio.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <>
      <PageHeader
        eyebrow="Novedades"
        title={
          <>
            El derecho,
            <br />
            <em>explicado simple.</em>
          </>
        }
        lead="Guías breves sobre situaciones legales frecuentes. Información general, no asesoramiento."
      />

      <section aria-label="Artículos" className="container-page">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">Pronto vas a encontrar artículos acá.</p>
        ) : (
          <ul className="border-t border-border">
            {posts.map((post, i) => (
              <Reveal as="li" key={post.slug} delay={i * 0.05} className="border-b border-border">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid gap-4 py-10 md:grid-cols-12 md:items-baseline md:gap-8"
                >
                  <p className="text-sm text-muted-foreground md:col-span-2">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </p>
                  <div className="md:col-span-8">
                    <p className="eyebrow">{getService(post.area)?.title}</p>
                    <h2 className="mt-3 display text-3xl transition-colors group-hover:text-brand md:text-5xl">
                      {post.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-muted-foreground">{post.description}</p>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2 md:justify-end">
                    {post.readingMinutes} min
                    <ArrowUpRight
                      className="size-4 transition-transform group-hover:rotate-45"
                      aria-hidden="true"
                    />
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
