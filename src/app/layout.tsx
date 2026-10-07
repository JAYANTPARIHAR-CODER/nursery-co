import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";

/**
 * Fraunces carries the editorial voice (headings, wordmark, prices);
 * Inter does the interface work. Both self-host through next/font, so
 * there is no render-blocking request to Google at runtime.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nurseryco.in"),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
  },
  description: BRAND.description,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2.5 focus:text-xs focus:tracking-[0.12em] focus:text-ink-invert focus:uppercase"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
