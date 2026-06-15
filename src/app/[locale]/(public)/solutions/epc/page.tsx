import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { ProjectCard } from "@/components/public/projects/project-card";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { SolutionsRow } from "@/components/public/solutions/solutions-row";
import { getSolutions } from "@/lib/cms/home";
import type { Locale } from "@/lib/cms/localize";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";
import { getPublishedEpcProjects, getSolutionPage } from "@/lib/cms/solutions";

export default async function EpcPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, projects, solutions, t, tSections, tLanding, tProjects] = await Promise.all([
    getSolutionPage("epc", locale),
    getPublishedEpcProjects(locale),
    getSolutions(locale),
    getTranslations("Solutions"),
    getTranslations("SectionTitles"),
    getTranslations("Landing"),
    getTranslations("Projects"),
  ]);

  if (page.status === "hidden") notFound();

  const hero = resolveHero({
    mode: page.heroMode,
    hero: page.hero,
    defaults: {
      eyebrow: t("epc.eyebrow"),
      title: tSections("epcTitle"),
      subtitle: t("epc.defaultSubtitle"),
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
        <ScrollReveal className="mb-10 max-w-3xl space-y-3">
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

      <SolutionsRow solutions={solutions} activeKey="epc" />
    </>
  );
}
