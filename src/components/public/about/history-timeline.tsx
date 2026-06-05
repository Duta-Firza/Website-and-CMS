import { ScrollReveal } from "@/components/public/scroll-reveal";
import type { HistoryEntryData } from "@/lib/cms/about";
import { cn } from "@/lib/utils";

interface Props {
  entries: HistoryEntryData[];
}

/**
 * Vertical alternating timeline.
 *
 * Mobile: left-aligned column with the year line at the very left edge,
 * each card stacked.
 *
 * Desktop (md+): cards alternate left/right of a centered vertical line.
 * A short horizontal connector arm reaches from the brand-accent dot on
 * the line to the nearest edge of each card. Each card is a hover target:
 * top accent stripe slides in, the bottom-right gets a soft brand-accent
 * corner triangle, the year reads bigger in mono brand-accent, and the
 * card lifts on hover.
 */
export function HistoryTimeline({ entries }: Props) {
  return (
    <div className="relative mx-auto max-w-5xl py-2">
      {/* Vertical line — left edge on mobile, center on desktop */}
      <span
        aria-hidden
        className="absolute left-4 top-0 h-full w-px bg-brand-deep/20 md:left-1/2 md:-translate-x-1/2 dark:bg-foreground/20"
      />

      <ul className="space-y-6 md:space-y-2">
        {entries.map((entry, idx) => {
          const onLeft = idx % 2 === 0;
          return (
            <li key={entry.id} className="relative">
              {/* Year dot on the line */}
              <span
                aria-hidden
                className="absolute left-4 top-6 z-10 block h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-background bg-brand-accent shadow-sm md:left-1/2"
              />

              {/* Connector arm — desktop only, from dot toward card */}
              <span
                aria-hidden
                className={cn(
                  "absolute top-8 hidden h-px bg-brand-deep/25 md:block dark:bg-foreground/25",
                  onLeft ? "right-1/2 w-8" : "left-1/2 w-8",
                )}
              />

              <ScrollReveal
                delay={idx * 80}
                className={cn(
                  "ml-10 md:ml-0 md:flex",
                  onLeft ? "md:justify-start" : "md:justify-end",
                )}
              >
                <article className="group/hist relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent/30 hover:shadow-md md:w-[calc(50%-2rem)] md:p-6">
                  {/* Top accent stripe — slides in from left on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-brand-accent transition-transform duration-500 group-hover/hist:scale-x-100"
                  />

                  {/* Corner triangle bottom-right — same vocabulary as Solution card */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 right-0 h-12 w-12 bg-brand-accent/6 transition-all duration-300 group-hover/hist:bg-brand-accent/10"
                    style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
                  />

                  {/* Year — large mono brand-accent, focal point of the card */}
                  <p className="font-mono text-2xl font-bold tracking-tight text-brand-accent md:text-3xl">
                    {entry.year}
                  </p>

                  <h3 className="mt-1 text-base font-semibold text-brand-deep transition-colors group-hover/hist:text-brand-accent md:text-lg dark:text-foreground">
                    {entry.title}
                  </h3>

                  {entry.description && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {entry.description}
                    </p>
                  )}
                </article>
              </ScrollReveal>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
