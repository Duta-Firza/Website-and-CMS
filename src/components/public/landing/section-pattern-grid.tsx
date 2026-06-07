import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/**
 * Blueprint-style grid backdrop. Faint horizontal + vertical rules at
 * 32px spacing — reads as graph paper without competing with content.
 * Drop-in alternative to `<SectionPattern />`.
 */
export function SectionPatternGrid({ className }: Props) {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-brand-deep/5 dark:text-foreground/8",
        className,
      )}
      aria-hidden
    >
      <defs>
        <pattern id="section-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#section-grid)" />
    </svg>
  );
}
