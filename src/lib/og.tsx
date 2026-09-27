import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const ogSize = { width: 1200, height: 630 };

export function renderOg({ eyebrow, title }: { eyebrow: string; title: string }) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "#f7f4ee",
        color: "#1b1916",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 4 }}
      >
        <span style={{ textTransform: "uppercase" }}>{eyebrow}</span>
        <span style={{ color: "#7a2a26" }}>{site.tagline.toUpperCase()}</span>
      </div>
      <div
        style={{ display: "flex", fontSize: 104, lineHeight: 1, letterSpacing: -2, maxWidth: 1000 }}
      >
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36 }}>
        <div style={{ width: 64, height: 2, background: "#7a2a26" }} />
        {site.name}
      </div>
    </div>,
    ogSize,
  );
}
