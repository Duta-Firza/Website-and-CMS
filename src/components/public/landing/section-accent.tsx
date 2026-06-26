import { cn } from "@/lib/utils";

type Variant = "orbit" | "plain" | "brackets" | "radar" | "ticks";

/** Soft centre-fading hairline — the divider drawn under every section. */
const DIVIDER =
  "h-px bg-linear-to-r from-transparent via-brand-primary/25 to-transparent dark:via-foreground/15";

/**
 * Per-section decorative accent. Each home section passes a different `variant`
 * so the sections read as visually distinct, while the shared thin-stroke,
 * brand-primary, low-opacity language keeps them a family and the continuous
 * page-level orbs/dot-grid keep the page cohesive. Sits behind content via
 * `absolute inset-0 -z-10`; the parent section must be
 * `relative isolate overflow-hidden`.
 */
export function SectionAccent({ variant, className }: { variant: Variant; className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
      aria-hidden
    >
      {variant === "orbit" && <Orbit />}
      {variant === "brackets" && <Brackets />}
      {variant === "radar" && <Radar />}
      {variant === "ticks" && <Ticks />}
      {/* Horizontal divider under every section (Partners band style). */}
      <div className={cn("absolute inset-x-0 bottom-0", DIVIDER)} />
    </div>
  );
}

/** Concentric "orbit" rings, top-right — nudged off the right edge so part
 *  bleeds off the screen side, but kept clear of the top boundary (no clipping
 *  along a section seam). */
function Orbit() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="absolute top-8 -right-12 size-56 text-brand-accent/24 dark:text-brand-accent/30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="60" cy="60" r="58" />
        <circle cx="60" cy="60" r="40" />
        <circle cx="60" cy="60" r="22" />
      </g>
    </svg>
  );
}

/** Registration brackets in the four corners — reads as a blueprint plate. */
function Brackets() {
  const base = "absolute size-15 border-brand-accent/80 dark:border-brand-accent";
  return (
    <>
      <span className={cn(base, "top-5 left-5 md:top-15 md:left-15 border-t border-l")} />
      <span className={cn(base, "top-5 right-5 md:top-15 md:right-15 border-t border-r")} />
      <span className={cn(base, "bottom-5 left-5 md:bottom-15 md:left-15 border-b border-l")} />
      <span className={cn(base, "bottom-5 right-5 md:bottom-15 md:right-15 border-b border-r")} />
    </>
  );
}

/** Crosshair "map locator" — rings + crosshair + centre dot, bottom-left.
 *  Nudged off the left edge so part bleeds off the screen side, but kept clear
 *  of the bottom boundary. Distinct from Solutions' plain rings, fits the map. */
function Radar() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="absolute bottom-8 -left-12 size-56 text-brand-accent/24 dark:text-brand-accent/30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="60" cy="60" r="52" />
        <circle cx="60" cy="60" r="32" />
        <line x1="60" y1="0" x2="60" y2="120" />
        <line x1="0" y1="60" x2="120" y2="60" />
      </g>
      <circle cx="60" cy="60" r="2.5" fill="currentColor" />
    </svg>
  );
}

/** A few small "+" registration ticks scattered around the edges. */
function Ticks() {
  return (
    <>
      <Plus className="top-10 left-8" />
      <Plus className="top-16 right-12" />
      <Plus className="bottom-12 left-1/4" />
      <Plus className="right-1/3 bottom-16" />
    </>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      className={cn("absolute size-2.5 text-brand-accent/80 dark:text-brand-accent", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 0V10M0 5H10" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
