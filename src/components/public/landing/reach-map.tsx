"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { ReachPointData } from "@/lib/cms/home";

// Leaflet touches `window` at module evaluation; lazy-load with SSR off.
const LeafletMap = dynamic(() => import("./reach-map-leaflet").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-xl border bg-muted/30 text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

interface Props {
  reachPoints: ReachPointData[];
}

export function ReachMap({ reachPoints }: Props) {
  const t = useTranslations("Landing");

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-20 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {t("ourReach")}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{t("ourReachSubtitle")}</p>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <LeafletMap reachPoints={reachPoints} />
        </div>
      </div>
    </section>
  );
}
