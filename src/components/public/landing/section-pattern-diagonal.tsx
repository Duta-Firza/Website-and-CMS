import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/**
 * Diagonal-hatching backdrop — thin parallel lines at 45°, 14px apart.
 * Reads as a technical-drawing fill / blueprint hatch. Drop-in alternative
 * to `<SectionPattern />`.
 */
export function SectionPatternDiagonal({ className }: Props) {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-brand-deep/5 dark:text-foreground/8",
        className,
      )}
      aria-hidden
    >
      <defs>
        <pattern
          id="section-diagonal"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="14" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#section-diagonal)" />
    </svg>
  );
}
