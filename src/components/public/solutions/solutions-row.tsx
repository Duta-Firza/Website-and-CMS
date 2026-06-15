import { getTranslations } from "next-intl/server";
import { SolutionCard } from "@/components/public/landing/solution-card";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import type { SolutionData } from "@/lib/cms/home";

interface Props {
  solutions: SolutionData[];
  /** Solution.key of the sub-page currently being viewed. The matching card
   * renders with a persistent brand-accent treatment so it stands out. */
  activeKey: string;
}

/**
 * Cross-solution navigation row rendered on each Solutions sub-page. Replaces
 * the standalone /solutions landing — users get a quick visual jump between
 * Trading / Manufacturing / EPC without losing the page-level context.
 */
export async function SolutionsRow({ solutions, activeKey }: Props) {
  const t = await getTranslations("Landing");
  if (solutions.length === 0) return null;
  return (
    <section className="mt-16 border-t pt-12">
      <ScrollReveal className="mb-8 max-w-2xl space-y-2">
        <span className="block h-0.75 w-10 bg-brand-accent" aria-hidden />
        <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-3xl">
          {t("ourSolutions")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("ourSolutionsSubtitle")}</p>
      </ScrollReveal>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {solutions.map((s, idx) => (
          <ScrollReveal key={s.id} delay={idx * 80}>
            <SolutionCard
              solution={s}
              learnMoreLabel={t("learnMore")}
              index={idx}
              isActive={s.key === activeKey}
            />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
