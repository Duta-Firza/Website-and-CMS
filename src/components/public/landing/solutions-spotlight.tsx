import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { cn } from "@/lib/utils";
import type { SolutionData } from "@/lib/cms/home";
import { SectionAccent } from "./section-accent";
import { SolutionCard } from "./solution-card";

const GRID_COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

/**
 * Server component — pulls i18n + the CMS data in one place, then hands each
 * row to the client `SolutionCard` for IntersectionObserver-driven animation.
 */
export async function SolutionsSpotlight({
  solutions,
  titleOverride,
  subtitleOverride,
  columnsPerRow = 3,
}: {
  solutions: SolutionData[];
  titleOverride?: string;
  subtitleOverride?: string;
  columnsPerRow?: number;
}) {
  const t = await getTranslations("Landing");
  if (solutions.length === 0) return null;
  const title = titleOverride?.trim() || t("ourSolutions");
  const subtitle = subtitleOverride?.trim() || t("ourSolutionsSubtitle");
  const colClass = GRID_COLS[columnsPerRow] ?? "md:grid-cols-3";

  return (
    <section className="relative isolate overflow-hidden">
      <SectionAccent variant="orbit" />
      <div className="container mx-auto px-4 py-20 md:py-24">
        <ScrollReveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="h-0.75 w-10 bg-brand-accent" aria-hidden />
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </ScrollReveal>
        <div className={cn("grid grid-cols-1 gap-6", colClass)}>
          {solutions.map((s, idx) => (
            <ScrollReveal key={s.id} delay={idx * 100}>
              <SolutionCard solution={s} learnMoreLabel={t("learnMore")} index={idx} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
