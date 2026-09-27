import { getService, serviceNumber, services } from "@/content/services";
import { ogSize, renderOg } from "@/lib/og";

export const alt = "Área de práctica";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  return renderOg({
    eyebrow: service ? `Área ${serviceNumber(slug)}` : "Servicios",
    title: service?.title ?? "Áreas de práctica",
  });
}
