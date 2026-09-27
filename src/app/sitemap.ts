import type { MetadataRoute } from "next";
import { services } from "@/content/services";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    "/",
    "/servicios",
    "/estudio",
    "/equipo",
    "/contacto",
    "/turnos",
    "/blog",
    "/privacidad",
    "/aviso-legal",
  ];
  const posts = await getAllPosts();

  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.6,
    })),
    ...services.map((s) => ({
      url: absoluteUrl(`/servicios/${s.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
