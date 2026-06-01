import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PT Duta Firza",
    template: "%s | PT Duta Firza",
  },
  description:
    "Indonesian energy and EPC company with 45+ years of industry expertise in instrumentation trading, manufacturing, and engineering project execution.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  manifest: "/images/favicon/site.webmanifest",
  icons: {
    icon: [
      { url: "/images/favicon/favicon.ico", sizes: "any" },
      { url: "/images/favicon/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/images/favicon/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/images/favicon/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "icon",
        url: "/images/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/images/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1a57" },
  ],
};

// Root layout is a pass-through. The HTML shell with <html>/<body> lives in
// src/app/[locale]/layout.tsx so the `lang` attribute reflects the active locale.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
