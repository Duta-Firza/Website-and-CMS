import { getTranslations } from "next-intl/server";
import type { SolutionData } from "@/lib/cms/home";
import { SolutionCard } from "./solution-card";

/**
 * Server component — pulls i18n + the CMS data in one place, then hands each
 * row to the client `SolutionCard` for IntersectionObserver-driven animation.
 */
export async function SolutionsSpotlight({ solutions }: { solutions: SolutionData[] }) {
  const t = await getTranslations("Landing");
  if (solutions.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-20 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {t("ourSolutions")}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{t("ourSolutionsSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {solutions.map((s, idx) => (
            <SolutionCard
              key={s.id}
              solution={s}
              learnMoreLabel={t("learnMore")}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
