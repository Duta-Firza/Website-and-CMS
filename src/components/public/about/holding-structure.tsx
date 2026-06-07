interface Props {
  groupLabel: string;
  divisions: { key: string; label: string }[];
}

/**
 * Static tree diagram echoing PDF page 6: parent "Duta Firza Holding Group"
 * box at top, three division boxes below connected by line-art. Labels are
 * passed in as props so it can be localized. Brand-deep borders + accent
 * connector lines preserve the technical-drawing aesthetic.
 */
export function HoldingStructure({ groupLabel, divisions }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Parent group box */}
      <div className="mx-auto w-fit max-w-full">
        <div className="rounded-lg border-2 border-brand-deep bg-card px-6 py-3 text-center shadow-sm dark:border-foreground">
          <p className="text-sm font-semibold text-brand-deep dark:text-foreground md:text-base">
            {groupLabel}
          </p>
        </div>
      </div>

      {/* Connector lines */}
      <svg
        viewBox="0 0 600 60"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="mx-auto h-12 w-full max-w-3xl text-brand-deep/40 dark:text-foreground/40"
        aria-hidden
      >
        <line x1="300" y1="0" x2="300" y2="20" />
        <line x1="100" y1="20" x2="500" y2="20" />
        <line x1="100" y1="20" x2="100" y2="60" />
        <line x1="300" y1="20" x2="300" y2="60" />
        <line x1="500" y1="20" x2="500" y2="60" />
      </svg>

      {/* Division boxes */}
      <div className="grid grid-cols-3 gap-3">
        {divisions.map((d) => (
          <div
            key={d.key}
            className="rounded-lg border bg-card px-3 py-3 text-center shadow-sm"
          >
            <p className="text-xs font-medium text-brand-deep dark:text-foreground md:text-sm">
              {d.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
