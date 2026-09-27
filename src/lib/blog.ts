import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";
import { services } from "@/content/services";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

const frontmatterSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20).max(200),
  date: z.iso.date(),
  area: z.enum(services.map((s) => s.slug) as [string, ...string[]]),
  author: z.string().min(3),
  draft: z.boolean().optional().default(false),
});

export type PostMeta = z.infer<typeof frontmatterSchema> & { slug: string; readingMinutes: number };
export type Post = PostMeta & { content: string };

const SLUG = /^[a-z0-9-]+$/;

async function readPost(file: string): Promise<Post> {
  const slug = file.replace(/\.mdx$/, "");
  const raw = await readFile(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const meta = frontmatterSchema.parse(data);
  return {
    ...meta,
    slug,
    content,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  let files: string[] = [];
  try {
    files = (await readdir(BLOG_DIR)).filter(
      (f) => f.endsWith(".mdx") && SLUG.test(f.replace(/\.mdx$/, "")),
    );
  } catch {
    return [];
  }
  const posts = await Promise.all(files.map(readPost));
  return posts
    .filter((p) => !p.draft || process.env.NODE_ENV === "development")
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((post) => {
      const meta: PostMeta & { content?: string } = { ...post };
      delete meta.content;
      return meta;
    });
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!SLUG.test(slug)) return null;
  try {
    const post = await readPost(`${slug}.mdx`);
    if (post.draft && process.env.NODE_ENV !== "development") return null;
    return post;
  } catch {
    return null;
  }
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
