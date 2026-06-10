"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SolutionData } from "@/lib/cms/home";
import { cn } from "@/lib/utils";
import { SolutionIllustration } from "./solution-illustration";

interface Props {
  solution: SolutionData;
  learnMoreLabel: string;
  index: number;
  /** When true, render the card with persistent brand-accent treatment — used
   * on solutions sub-pages to mark the entry that matches the current page. */
  isActive?: boolean;
}

export function SolutionCard({ solution, learnMoreLabel, index: _index, isActive = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [hoverKey, setHoverKey] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Card
      ref={ref}
      onMouseEnter={() => setHoverKey((k) => k + 1)}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-accent/30 hover:shadow-md",
        isActive && "border-brand-accent bg-brand-accent/5 shadow-md",
      )}
    >
      {/* Top accent stripe — visible always when active; slides in on hover otherwise. */}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left bg-brand-accent transition-transform duration-500",
          isActive ? "scale-x-100" : "scale-x-0 group-hover/card:scale-x-100",
        )}
      />

      {/* Diagonal corner cut — stronger brand-accent triangle when active. */}
      <span
        className={cn(
          "pointer-events-none absolute bottom-0 right-0 h-16 w-16 transition-all duration-300",
          isActive ? "bg-brand-accent/15" : "bg-brand-accent/6 group-hover/card:bg-brand-accent/10",
        )}
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        aria-hidden
      />

      <CardHeader>
        <div className="relative mb-4 flex h-32 items-center justify-center md:h-40">
          {/* Subtle dot-grid backdrop — echoes the hero-pattern aesthetic */}
          <DotsBackdrop />
          {/* Illustration on top of the backdrop */}
          <div className="relative h-full w-full">
            <SolutionIllustration
              solutionKey={solution.key}
              playing={entered}
              hoverKey={hoverKey}
            />
          </div>
        </div>
        <CardTitle
          className={cn(
            "text-xl text-brand-deep dark:text-foreground",
            isActive && "text-brand-accent",
          )}
        >
          {solution.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative flex flex-1 flex-col gap-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{solution.description}</p>
        {!isActive && (
          <Link
            href={solution.href}
            className={cn(
              "mt-auto inline-flex items-center gap-1 text-sm font-medium transition-colors group-hover/card:text-brand-accent",
              isActive
                ? "text-brand-accent"
                : "text-brand-deep dark:text-foreground",
            )}
          >
            {learnMoreLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover/card:translate-x-1" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function DotsBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-brand-deep/6 transition-opacity duration-300 group-hover/card:opacity-150"
      aria-hidden
    >
      <defs>
        <pattern id="sol-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sol-dots)" />
    </svg>
  );
}
