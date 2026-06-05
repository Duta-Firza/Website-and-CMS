"use client";

import {
  Award,
  Briefcase,
  Building2,
  CalendarClock,
  ChartBar,
  Factory,
  Globe,
  type LucideIcon,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import type { StatData } from "@/lib/cms/home";

const ICON_MAP: Record<string, LucideIcon> = {
  ChartBar,
  CalendarClock,
  Users,
  Briefcase,
  Award,
  Building2,
  Factory,
  Wrench,
  Globe,
  TrendingUp,
};

function pickIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? ChartBar;
}

/**
 * No outer <section> with bg-background — that backdrop was visually wrapping
 * the negative margin and made the card look flush with the hero instead of
 * floating above it. The card is now a standalone container that pulls itself
 * up into the hero via -mt-20/-mt-24 and adds its own mb-* below for spacing
 * before the next section.
 */
export function QuickStats({ stats }: { stats: StatData[] }) {
  return (
    <ScrollReveal className="container relative z-10 mx-auto -mt-20 mb-16 px-4 md:-mt-28 md:mb-20">
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
        {/* Brand-accent strip across the top of the card */}
        <span className="absolute inset-x-0 top-0 h-1 bg-brand-accent" />
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((stat) => (
            <StatCell key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}

function StatCell({ stat }: { stat: StatData }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);
  const Icon = pickIcon(stat.iconName);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1500;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            setCount(Math.round(stat.value * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat.value]);

  return (
    <div ref={ref} className="flex items-center gap-4 px-6 py-8 md:px-8 md:py-10">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-deep/10 text-brand-deep dark:bg-foreground/10 dark:text-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-3xl font-semibold tracking-tight text-brand-deep md:text-4xl dark:text-foreground">
          {stat.prefix}
          {count.toLocaleString()}
          {stat.suffix}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {stat.label}
        </p>
      </div>
    </div>
  );
}
