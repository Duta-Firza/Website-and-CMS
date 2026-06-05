import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import type { SolutionData } from "@/lib/cms/home";
import { SectionIndex } from "./section-index";
import { SolutionCard } from "./solution-card";

/**
 * Server component — pulls i18n + the CMS data in one place, then hands each
 * row to the client `SolutionCard` for IntersectionObserver-driven animation.
 */
export async function SolutionsSpotlight({ solutions }: { solutions: SolutionData[] }) {
  const t = await getTranslations("Landing");
  if (solutions.length === 0) return null;

  return (
    <section className="relative bg-background">
      {/* <SectionIndex value="02" /> */}
      <div className="container mx-auto px-4 py-20 md:py-24">
        <ScrollReveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="h-0.75 w-10 bg-brand-accent" aria-hidden />
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {t("ourSolutions")}
          </h2>
          <p className="text-base text-muted-foreground">{t("ourSolutionsSubtitle")}</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
