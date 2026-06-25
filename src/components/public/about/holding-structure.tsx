import { cn } from "@/lib/utils";

interface Props {
  groupLabel: string;
  divisions: { key: string; label: string }[];
}

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

/**
 * Dynamic tree diagram: parent box at top, N division boxes below connected by
 * CSS-based connector lines. Using flex + gap-3 (matching the grid) guarantees
 * the connector drops land perfectly over each box center regardless of N.
 */
export function HoldingStructure({ groupLabel, divisions }: Props) {
  const n = divisions.length;

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

      {/* Connector lines — CSS flex + same gap-3 as grid ensures pixel-perfect alignment */}
      <div aria-hidden className="relative flex h-12 items-start gap-3">
        {/* Vertical stem from parent box down to the horizontal bar */}
        <div className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-brand-deep/40 dark:bg-foreground/40" />

        {divisions.map((d, i) => (
          <div key={d.key} className="relative flex flex-1 flex-col items-center">
            {/* Horizontal bar — extends ½ gap-3 (0.375 rem = spacing-1.5) into each adjacent
                gutter so segments from neighbouring items overlap and form a continuous line */}
            {n > 1 && (
              <div
                className={cn(
                  "absolute top-4 h-px bg-brand-deep/40 dark:bg-foreground/40",
                  i === 0
                    ? "left-1/2 -right-1.5"
                    : i === n - 1
                      ? "-left-1.5 right-1/2"
                      : "-inset-x-1.5",
                )}
              />
            )}
            {/* Vertical drop from horizontal bar to top of box */}
            <div className="mt-4 h-8 w-px bg-brand-deep/40 dark:bg-foreground/40" />
          </div>
        ))}
      </div>

      {/* Division boxes — same gap-3 as the connector row above */}
      <div className={cn("grid gap-3", GRID_COLS[n] ?? "grid-cols-3")}>
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
