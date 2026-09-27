import { site } from "@/content/site";
import { ogSize, renderOg } from "@/lib/og";

export const alt = `${site.legalName} — Estudio jurídico`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({ eyebrow: "Buenos Aires", title: "Derecho claro para decisiones importantes." });
}
