import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { ProjectCard } from "@/components/public/projects/project-card";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import type { Locale } from "@/lib/cms/localize";
import { getPublishedEpcProjects, getSolutionPage } from "@/lib/cms/solutions";

export default async function EpcPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, projects, t, tSections, tLanding, tProjects] = await Promise.all([
    getSolutionPage("epc", locale),
    getPublishedEpcProjects(locale),
    getTranslations("Solutions"),
    getTranslations("SectionTitles"),
    getTranslations("Landing"),
    getTranslations("Projects"),
  ]);

  if (page.status === "hidden") notFound();

  const eyebrow = page.hero.eyebrow || t("epc.eyebrow");
  const title = page.hero.title || tSections("epcTitle");
  const subtitle = page.hero.subtitle || t("epc.defaultSubtitle");

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

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={subtitle} />

      {(page.body.heading || page.body.content) && (
        <ScrollReveal className="mb-10 max-w-3xl space-y-3">
          {page.body.heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
              {page.body.heading}
            </h2>
          )}
          {page.body.content && (
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {page.body.content}
            </p>
          )}
        </ScrollReveal>
      )}

      {projects.length === 0 ? (
        <p className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          {t("epc.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, idx) => (
            <ScrollReveal key={p.id} delay={Math.min(idx, 5) * 60}>
              <ProjectCard
                project={{ ...p, category: "epc" }}
                locale={locale}
                fallbackBadge={tLanding("caseStudy")}
                viewProjectLabel={tProjects("viewProject")}
              />
            </ScrollReveal>
          ))}
        </div>
      )}
    </>
  );
}
