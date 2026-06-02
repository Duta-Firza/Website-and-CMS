import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

/**
 * Root layout owns <html>, <body>, fonts, and ThemeProvider — none of these
 * should remount on locale switch. The [locale] subtree only swaps content
 * + i18n messages and uses `<LangSync>` to patch `<html lang>` on the client.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={routing.defaultLocale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
