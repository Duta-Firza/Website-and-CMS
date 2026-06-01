import type { Metadata } from "next";
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
};

// Root layout is a pass-through. The HTML shell with <html>/<body> lives in
// src/app/[locale]/layout.tsx so the `lang` attribute reflects the active locale.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
