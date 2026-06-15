import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { InquiryForm } from "@/components/public/inquiry-form";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { SolutionsRow } from "@/components/public/solutions/solutions-row";
import { getSolutions } from "@/lib/cms/home";
import type { Locale } from "@/lib/cms/localize";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";
import { getSolutionPage, getSolutionPageFormSettings } from "@/lib/cms/solutions";

export default async function ManufacturingPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, solutions, t, tSections, formSettings] = await Promise.all([
    getSolutionPage("manufacturing", locale),
    getSolutions(locale),
    getTranslations("Solutions"),
    getTranslations("SectionTitles"),
    getSolutionPageFormSettings("manufacturing", locale),
  ]);

  if (page.status === "hidden") notFound();

  const hero = resolveHero({
    mode: page.heroMode,
    hero: page.hero,
    defaults: {
      eyebrow: tSections("solutionsEyebrow"),
      title: tSections("manufacturingTitle"),
      subtitle: "",
    },
  });
  const body = resolveBody({
    mode: page.bodyMode,
    body: page.body,
    defaults: { heading: "", content: "" },
  });

  if (page.status === "comingSoon") {
    return (
      <>
        {hero && (
          <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />
        )}
        <ComingSoonPage
          eyebrow={hero?.eyebrow}
          title={body?.heading || undefined}
          message={page.comingSoonMessage || undefined}
        />
      </>
    );
  }

  return (
    <>
      {hero && <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />}

      {body && (body.heading || body.content) && (
        <ScrollReveal className="mb-12 max-w-3xl space-y-3">
          {body.heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
              {body.heading}
            </h2>
          )}
          {body.content && (
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {body.content}
            </p>
          )}
        </ScrollReveal>
      )}

      {formSettings.enabled && (
        <ScrollReveal>
          <div className="mt-12 rounded-2xl border bg-card p-6 md:p-10">
            <div className="mb-6 max-w-2xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
                {t("manufacturing.quoteTitle")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("manufacturing.quoteSubtitle")}
              </p>
            </div>
            <InquiryForm
              source="manufacturing"
              fields={formSettings.fields}
              submitLabel={formSettings.submitLabel}
              successMessage={formSettings.successMessage}
            />
          </div>
        </ScrollReveal>
      )}

      <SolutionsRow solutions={solutions} activeKey="manufacturing" />
    </>
  );
}
