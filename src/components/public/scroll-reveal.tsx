"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  /** Delay before this block animates, in ms. Useful for staggered cascades
   *  inside grids (e.g. card-index * 100). */
  delay?: number;
  /** Element tag — defaults to "div" but can be any block element. */
  as?: "div" | "section" | "article" | "li" | "header" | "footer";
  className?: string;
}

/**
 * Block-level reveal: fades + slides up as the element enters the viewport,
 * and fades + slides back down when it leaves (symmetric, by user request).
 *
 * Uses a per-instance IntersectionObserver to drive a CSS transition — the
 * tween is GPU-accelerated and `prefers-reduced-motion` is honoured both by
 * the Tailwind `motion-reduce:` variant here AND by the global CSS guard
 * in globals.css.
 */
export function ScrollReveal({ children, delay = 0, as = "div", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Trigger when the element is still 120px BELOW the viewport. The
    // animation runs while the element is approaching the fold, so by the
    // time the user looks at the area the motion is already in progress —
    // no abrupt kick-off as the element pops into view.
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { threshold: 0, rootMargin: "0px 0px 120px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      // biome-ignore lint/suspicious/noExplicitAny: dynamic tag requires loose ref typing
      ref={ref as any}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        // `will-change-transform` asks the browser to keep the element on a
        // composited layer so the first transition frame is buttery instead
        // of janky (no layer-promotion cost at animation start). 1200ms with
        // an expo-out curve gives a slow, glide-y feel — the motion finishes
        // gently rather than snapping.
        "will-change-transform transition-[opacity,transform] duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        // 48px of travel makes the rise unmistakably visible.
        visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
