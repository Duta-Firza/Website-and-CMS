"use client";

import { useEffect, useRef, useState } from "react";
import type { StatData } from "@/lib/cms/home";

export function QuickStats({ stats }: { stats: StatData[] }) {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:divide-x md:divide-border">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat }: { stat: StatData }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

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
    <div
      ref={ref}
      className="flex flex-col items-center justify-center px-6 text-center md:items-start md:text-left"
    >
      <p className="text-5xl font-semibold tracking-tight text-brand-deep md:text-6xl dark:text-foreground">
        {stat.prefix}
        {count.toLocaleString()}
        {stat.suffix}
      </p>
      <p className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {stat.label}
      </p>
    </div>
  );
}
