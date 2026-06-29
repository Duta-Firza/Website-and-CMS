import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { IrThumbnail } from "@/components/public/ir/ir-thumbnail";
import { ReportDownloadActions } from "@/components/public/ir/report-download-actions";
import { ListToolbar } from "@/components/public/list-toolbar";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { PageTabs } from "@/components/public/section/page-tabs";
import { resolveActiveTab } from "@/components/public/section/resolve-active-tab";
import { PaginationNav } from "@/components/ui/pagination-nav";
import {
  getIrSubPage,
  getReportDownloadFormSettings,
  getReports,
} from "@/lib/cms/investor-relations";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";

function toLocale(l: string): "id" | "en" {
  return l === "en" ? "en" : "id";
}

const TABS = [{ key: "annual" }, { key: "financial" }] as const;
const PAGE_SIZE = 9;

interface PageParams {
  locale: string;
}
interface SearchParams {
  tab?: string;
  q?: string;
  sort?: string;
  filter?: string;
  page?: string;
}

export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const safeLocale = toLocale(locale);

  const activeTab = resolveActiveTab(TABS, sp.tab, "annual");

  const [tSec, tIR, meta, { items: reports }, formSettings] = await Promise.all([
    getTranslations("SectionTitles"),
    getTranslations("IR"),
    getIrSubPage("reports", safeLocale),
    getReports(safeLocale, activeTab as "annual" | "financial", true),
    getReportDownloadFormSettings(safeLocale),
  ]);

  if (meta.status === "hidden") notFound();

  const hero = resolveHero({
    mode: meta.heroMode,
    hero: meta.hero,
    defaults: {
      eyebrow: tSec("investorRelationsEyebrow"),
      title: tSec("reportsTitle"),
      subtitle: "",
    },
  });
  const body = resolveBody({
    mode: meta.bodyMode,
    body: meta.body,
    defaults: { heading: "", content: "" },
  });

  const tAdmin = await getTranslations("Admin");
  const tabs = [
    { key: "annual", label: tAdmin("tabs.annual") },
    { key: "financial", label: tAdmin("tabs.financial") },
  ];

  if (meta.status === "comingSoon") {
    return (
      <>
        {hero && (
          <PageHeader
            eyebrow={hero.eyebrow}
            title={hero.title}
            description={hero.subtitle}
            tabs={<PageTabs tabs={tabs} defaultKey="annual" />}
          />
        )}
        <ComingSoonPage
          eyebrow={hero?.eyebrow}
          title={body?.heading || undefined}
          message={body?.content || undefined}
        />
      </>
    );
  }

  // Distinct years (from the full list) drive the filter dropdown.
  const years = [...new Set(reports.map((r) => r.year))].sort((a, b) => b - a);
  const q = (sp.q ?? "").trim().toLowerCase();
  const sort = sp.sort ?? "newest";
  const activeYear =
    sp.filter && years.includes(Number(sp.filter)) ? String(Number(sp.filter)) : "all";

  let visible = reports.filter((r) => {
    if (activeYear !== "all" && String(r.year) !== activeYear) return false;
    if (!q) return true;
    return `${r.title} ${r.description}`.toLowerCase().includes(q);
  });
  if (sort === "oldest") {
    visible = [...visible].sort((a, b) => a.year - b.year);
  } else if (sort === "title") {
    visible = [...visible].sort((a, b) => a.title.localeCompare(b.title, safeLocale));
  } else {
    visible = [...visible].sort((a, b) => b.year - a.year);
  }

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), totalPages);
  const paged = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const baseUrl = `/${locale}/investor-relations/reports`;
  const extraParams: Record<string, string> = {};
  if (activeTab !== "annual") extraParams.tab = activeTab;
  if (q) extraParams.q = q;
  if (sort !== "newest") extraParams.sort = sort;
  if (activeYear !== "all") extraParams.filter = activeYear;

  return (
    <>
      {hero && (
        <PageHeader
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.subtitle}
          tabs={<PageTabs tabs={tabs} defaultKey="annual" />}
        />
      )}

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

      {reports.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{tIR("noReportsYet")}</p>
      ) : (
        <>
          <ListToolbar
            searchPlaceholder={tIR("searchReports")}
            searchAriaLabel={tIR("searchReports")}
            sortLabel={tIR("sortLabel")}
            sortOptions={[
              { value: "newest", label: tIR("sortNewest") },
              { value: "oldest", label: tIR("sortOldest") },
              { value: "title", label: tIR("sortTitle") },
            ]}
            filterLabel={tIR("filterYear")}
            filterOptions={[
              { value: "all", label: tIR("allYears") },
              ...years.map((y) => ({ value: String(y), label: String(y) })),
            ]}
          />

          {paged.length === 0 ? (
            <p className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              {tIR("noResults")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((report, idx) => (
                <ScrollReveal key={report.id} delay={Math.min(idx, 5) * 60}>
                  <div className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card">
                    <IrThumbnail src={report.thumbnailUrl || undefined} alt={report.title} />
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {report.year}
                      </p>
                      <h3 className="mt-1 text-base font-semibold leading-snug text-brand-deep dark:text-foreground">
                        {report.title}
                      </h3>
                      {report.description && (
                        <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted-foreground">
                          {report.description}
                        </p>
                      )}
                      <ReportDownloadActions
                        reportId={report.id}
                        fileUrl={report.fileUrl}
                        title={report.title}
                        viewLabel={tIR("viewReport")}
                        downloadLabel={tIR("downloadReport")}
                        formSettings={formSettings}
                      />
                    </div>
                  </div>
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
    </>
  );
}
