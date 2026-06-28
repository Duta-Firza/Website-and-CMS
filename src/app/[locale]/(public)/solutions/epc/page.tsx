import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { ListToolbar } from "@/components/public/list-toolbar";
import { ProjectCard } from "@/components/public/projects/project-card";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { SolutionsRow } from "@/components/public/solutions/solutions-row";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { getSolutions } from "@/lib/cms/home";
import type { Locale } from "@/lib/cms/localize";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";
import { getPublishedEpcProjects, getSolutionPage } from "@/lib/cms/solutions";

const PAGE_SIZE = 9;

interface SearchParams {
  q?: string;
  sort?: string;
  filter?: string;
  page?: string;
}

export default async function EpcPublicPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const locale = (await getLocale()) as Locale;
  const [page, projects, solutions, t, tSections, tLanding, tProjects, sp] = await Promise.all([
    getSolutionPage("epc", locale),
    getPublishedEpcProjects(locale),
    getSolutions(locale),
    getTranslations("Solutions"),
    getTranslations("SectionTitles"),
    getTranslations("Landing"),
    getTranslations("Projects"),
    searchParams,
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

  // Distinct years (built from the full list) drive the filter dropdown.
  const years = [
    ...new Set(projects.map((p) => p.year).filter((y): y is number => y != null)),
  ].sort((a, b) => b - a);
  const q = (sp.q ?? "").trim().toLowerCase();
  const sort = sp.sort ?? "default";
  const activeYear =
    sp.filter && years.includes(Number(sp.filter)) ? String(Number(sp.filter)) : "all";

  let visible = projects.filter((p) => {
    if (activeYear !== "all" && String(p.year) !== activeYear) return false;
    if (!q) return true;
    return [p.title, p.summary, p.client].join(" ").toLowerCase().includes(q);
  });

  if (sort === "yearDesc") {
    visible = [...visible].sort((a, b) => (b.year ?? -Infinity) - (a.year ?? -Infinity));
  } else if (sort === "yearAsc") {
    visible = [...visible].sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity));
  } else if (sort === "nameAsc") {
    visible = [...visible].sort((a, b) => a.title.localeCompare(b.title, locale));
  }

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), totalPages);
  const paged = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const baseUrl = `/${locale}/solutions/epc`;
  const extraParams: Record<string, string> = {};
  if (sp.q?.trim()) extraParams.q = sp.q.trim();
  if (sort !== "default") extraParams.sort = sort;
  if (activeYear !== "all") extraParams.filter = activeYear;

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
        <>
          <ListToolbar
            searchPlaceholder={t("epc.searchPlaceholder")}
            searchAriaLabel={t("epc.searchPlaceholder")}
            sortLabel={t("epc.sortLabel")}
            sortOptions={[
              { value: "default", label: t("epc.sortDefault") },
              { value: "yearDesc", label: t("epc.sortNewest") },
              { value: "yearAsc", label: t("epc.sortOldest") },
              { value: "nameAsc", label: t("epc.sortNameAsc") },
            ]}
            filterLabel={t("epc.filterYear")}
            filterOptions={[
              { value: "all", label: t("epc.allYears") },
              ...years.map((y) => ({ value: String(y), label: String(y) })),
            ]}
          />

          {paged.length === 0 ? (
            <p className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              {t("epc.noResults")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((p, idx) => (
                <ScrollReveal key={p.id} delay={Math.min(idx, 5) * 60}>
                  <ProjectCard
                    project={{ ...p, category: "epc" }}
                    locale={locale}
                    fallbackBadge={tLanding("caseStudy")}
                    viewProjectLabel={tProjects("viewProject")}
                    highlight={q}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}

          <PaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={baseUrl}
            extraParams={Object.keys(extraParams).length > 0 ? extraParams : undefined}
          />
        </>
      )}

      <SolutionsRow solutions={solutions} activeKey="epc" />
    </>
  );
}
