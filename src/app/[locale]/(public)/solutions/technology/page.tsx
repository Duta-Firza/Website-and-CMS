import { ArrowUpRight, Globe } from "lucide-react";
import Link from "next/link";
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

export default async function TechnologyPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, solutions, t, tSections, formSettings] = await Promise.all([
    getSolutionPage("technology", locale),
    getSolutions(locale),
    getTranslations("Solutions"),
    getTranslations("SectionTitles"),
    getSolutionPageFormSettings("technology", locale),
  ]);

  if (page.status === "hidden") notFound();

  const hero = resolveHero({
    mode: page.heroMode,
    hero: page.hero,
    defaults: {
      eyebrow: tSections("solutionsEyebrow"),
      title: tSections("technologyTitle"),
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

      {page.websiteLink.enabled && page.websiteLink.url && (
        <ScrollReveal>
          <Link
            href={page.websiteLink.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group/site relative mt-12 flex flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent/40 hover:shadow-md md:flex-row md:items-center md:justify-between md:p-10"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-brand-accent transition-transform duration-500 group-hover/site:scale-x-100" />
            <div className="relative flex items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-deep/5 text-brand-deep transition-colors duration-300 group-hover/site:bg-brand-accent/10 group-hover/site:text-brand-accent dark:bg-foreground/5 dark:text-foreground">
                <Globe className="h-5 w-5" />
              </span>
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold tracking-tight text-brand-deep transition-colors duration-300 group-hover/site:text-brand-accent dark:text-foreground">
                  {page.websiteLink.title || t("technology.websiteTitle")}
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {page.websiteLink.description || t("technology.websiteSubtitle")}
                </p>
              </div>
            </div>
            <span className="relative inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-brand-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 group-hover/site:bg-brand-accent/90 md:self-auto">
              {page.websiteLink.ctaLabel || t("technology.websiteCta")}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/site:-translate-y-0.5 group-hover/site:translate-x-0.5" />
            </span>
          </Link>
        </ScrollReveal>
      )}

      {formSettings.enabled && (
        <ScrollReveal>
          <div className="mt-12 rounded-2xl border bg-card p-6 md:p-10">
            <div className="mb-6 max-w-2xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
                {t("technology.inquiryTitle")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("technology.inquirySubtitle")}
              </p>
            </div>
            <InquiryForm
              source="technology"
              fields={formSettings.fields}
              submitLabel={formSettings.submitLabel}
              successMessage={formSettings.successMessage}
            />
          </div>
        </ScrollReveal>
      )}

      <SolutionsRow solutions={solutions} activeKey="technology" />
    </>
  );
}
