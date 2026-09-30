import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { site } from "@/content/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Estudio jurídico en Buenos Aires`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.legalName,
  authors: [{ name: site.legalName }],
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.legalName,
    url: "/",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${manrope.variable} ${geistMono.variable} ${newsreader.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only z-50 rounded bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Saltar al contenido
        </a>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
