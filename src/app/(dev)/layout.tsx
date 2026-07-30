import type { Metadata } from "next";
import { DevChrome } from "@/components/devtools/dev-chrome";

export const metadata: Metadata = {
  title: { default: "Dev Console", template: "%s · Dev Console" },
  robots: { index: false, follow: false },
};

/**
 * Shell for the non-localised /dev area (/devbooks, /devtools, /devlogin).
 * Sits directly under the root layout (outside [locale]), so no next-intl
 * provider is loaded here. Access is gated by src/proxy.ts + per-route checks.
 */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DevChrome />
      {children}
    </div>
  );
}
