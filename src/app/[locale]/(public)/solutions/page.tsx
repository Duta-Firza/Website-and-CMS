import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { SolutionCard } from "@/components/public/landing/solution-card";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { getSolutions } from "@/lib/cms/home";
import type { Locale } from "@/lib/cms/localize";
import { getSolutionPage } from "@/lib/cms/solutions";

export default async function SolutionsLandingPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, t, tSections, tLanding, solutions] = await Promise.all([
    getSolutionPage("solutions", locale),
    getTranslations("Solutions"),
    getTranslations("SectionTitles"),
    getTranslations("Landing"),
    getSolutions(locale),
  ]);

  if (page.status === "hidden") notFound();

  const eyebrow = page.hero.eyebrow || tSections("solutionsEyebrow");
  const title = page.hero.title || t("landing.title");
  const subtitle = page.hero.subtitle || t("landing.subtitle");

  if (page.status === "comingSoon") {
    return (
      <>
        <PageHeader eyebrow={eyebrow} title={title} description={subtitle} />
        <ComingSoonPage
          eyebrow={eyebrow}
          title={page.body.heading || undefined}
          message={page.comingSoonMessage || undefined}
        />
      </>
    );
  }

  const heading = page.body.heading;
  const content = page.body.content;

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={subtitle} />
      {(heading || content) && (
        <ScrollReveal className="mb-12 max-w-3xl space-y-3">
          {heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
              {heading}
            </h2>
          )}
          {content && (
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {content}
            </p>
          )}
        </ScrollReveal>
      )}
      {solutions.length > 0 && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {solutions.map((s, idx) => (
            <ScrollReveal key={s.id} delay={idx * 100}>
              <SolutionCard solution={s} learnMoreLabel={tLanding("learnMore")} index={idx} />
            </ScrollReveal>
          ))}
        </section>
      )}
    </>
  );
}
