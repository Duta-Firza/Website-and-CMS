import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/**
 * Subtle dot-grid backdrop used at the section level to give plain bg-muted/40
 * or bg-background sections a hint of blueprint/technical-drawing texture.
 * Lives behind content via `absolute inset-0 pointer-events-none` — parent
 * section needs `relative` for stacking.
 */
export function SectionPattern({ className }: Props) {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full bg-muted/25 text-brand-deep/15 dark:text-foreground/10",
        className,
      )}
      aria-hidden
    >
      <defs>
        <pattern id="section-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#section-dots)" />
    </svg>
  );
}
