import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { JsonLd } from "@/components/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { getService } from "@/content/services";
import { site } from "@/content/site";
import { formatDate, getAllPosts, getPost } from "@/lib/blog";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata({ title: post.title, description: post.description, path: `/blog/${slug}` });
}

const components = {
  a: ({ href = "", ...props }: React.ComponentProps<"a">) =>
    href.startsWith("/") ? (
      <Link href={href} className="link-underline" {...props} />
    ) : (
      <a
        href={href}
        className="link-underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
};

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) notFound();
  const service = getService(post.area);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { "@type": "Person", name: post.author },
          publisher: { "@type": "Organization", name: site.legalName, url: site.url },
          mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
        }}
      />
      <article className="container-page pt-12 md:pt-20">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          ← Novedades
        </Link>
        <header className="mt-10 max-w-4xl">
          {service ? (
            <Link href={`/servicios/${service.slug}`} className="eyebrow hover:text-brand">
              {service.title}
            </Link>
          ) : null}
          <h1 className="mt-6 display text-5xl md:text-7xl">{post.title}</h1>
          <p className="mt-6 text-sm text-muted-foreground">
            {post.author} · <time dateTime={post.date}>{formatDate(post.date)}</time> ·{" "}
            {post.readingMinutes} min de lectura
          </p>
        </header>

        <div className="mt-14 max-w-2xl space-y-6 text-lg leading-relaxed [&_h2]:mt-14 [&_h2]:display [&_h2]:text-3xl [&_li]:ml-6 [&_li]:list-disc [&_p]:text-muted-foreground [&_strong]:text-foreground [&_ul]:space-y-2 [&_ul]:text-muted-foreground">
          <MDXRemote source={post.content} components={components} />
        </div>

        <p className="mt-16 max-w-2xl border-t border-border pt-6 text-sm text-muted-foreground">
          Este artículo brinda información general y no constituye asesoramiento legal. Cada caso
          requiere un análisis particular.
        </p>
      </article>
      <CtaBand />
    </>
  );
}
