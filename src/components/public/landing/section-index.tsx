interface Props {
  /** Two-digit index, e.g. "01". */
  value: string;
  /** Total count for the "X / Y" display. Defaults to 5 (Partners through Customers). */
  total?: string;
}

/**
 * Small monospace section index in the top-right corner — a tiny
 * technical-drawing detail that reinforces the industrial / blueprint vibe
 * without taking visual weight. Parent section needs `relative`.
 */
export function SectionIndex({ value, total = "05" }: Props) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute right-4 top-6 z-10 font-mono text-[11px] font-semibold tracking-wider text-brand-deep/30 md:right-8 md:top-8 dark:text-foreground/30"
    >
      {value} / {total}
    </span>
  );
}
