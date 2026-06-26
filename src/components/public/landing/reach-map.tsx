"use client";

import { Globe, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import type { ReachPointData } from "@/lib/cms/home";
import { SectionAccent } from "./section-accent";

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
  titleOverride?: string;
  subtitleOverride?: string;
}

export function ReachMap({ reachPoints, titleOverride, subtitleOverride }: Props) {
  const t = useTranslations("Landing");
  const totalCities = reachPoints.length;
  const totalProvinces = new Set(reachPoints.map((p) => p.province)).size;
  const title = titleOverride?.trim() || t("ourReach");
  const subtitle = subtitleOverride?.trim() || t("ourReachSubtitle");

  return (
    <section className="relative isolate overflow-hidden">
      <SectionAccent variant="radar" />
      <div className="container mx-auto px-4 py-20 md:py-24">
        <ScrollReveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="h-0.75 w-10 bg-brand-accent" aria-hidden />
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </ScrollReveal>

        <ScrollReveal delay={100} className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ReachStat value={totalCities} label={t("reachCities")} icon="pin" />
          <ReachStat value={totalProvinces} label={t("reachProvinces")} icon="pin" />
          <ReachStat label={t("reachNational")} icon="globe" />
        </ScrollReveal>

        {/* `relative z-0` creates a new stacking context that caps Leaflet's
            internal z-indexes (which go up to 1000 for controls/tooltips) so
            the fixed navbar (z-50) remains on top when the user scrolls. */}
        <ScrollReveal
          delay={200}
          className="relative z-0 overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          <LeafletMap reachPoints={reachPoints} />
        </ScrollReveal>

        {reachPoints.length > 0 && (
          <ScrollReveal delay={300} className="mt-10">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("whereWeOperate")}
            </p>
            <div className="flex flex-wrap gap-2">
              {reachPoints.map((pt) => (
                <Badge
                  key={pt.id}
                  variant="secondary"
                  className="text-xs font-normal text-brand-deep dark:text-foreground"
                >
                  {pt.city}
                </Badge>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}

function ReachStat({
  value,
  label,
  icon,
}: {
  value?: number;
  label: string;
  icon: "pin" | "globe";
}) {
  const Icon = icon === "globe" ? Globe : MapPin;
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card px-5 py-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        {value !== undefined && (
          <p className="text-3xl font-semibold tracking-tight text-brand-deep md:text-4xl dark:text-foreground">
            {value}
          </p>
        )}
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}
