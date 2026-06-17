import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { ReportActions } from "@/components/public/ir/report-preview-dialog";
import { PageHeader } from "@/components/public/section/page-header";
import { PageTabs } from "@/components/public/section/page-tabs";
import { resolveActiveTab } from "@/components/public/section/resolve-active-tab";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { getIrSubPage, getReports } from "@/lib/cms/investor-relations";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";

function toLocale(l: string): "id" | "en" {
  return l === "en" ? "en" : "id";
}

const TABS = [{ key: "annual" }, { key: "financial" }] as const;
const PAGE_SIZE = 10;

interface PageParams {
  locale: string;
}
interface SearchParams {
  tab?: string;
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
  const currentPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [tSec, tTabsRaw, tIR, meta, { items: reports, totalPages }] = await Promise.all([
    getTranslations("SectionTitles"),
    getTranslations("SectionTitles"),
    getTranslations("IR"),
    getIrSubPage("reports", safeLocale),
    getReports(safeLocale, activeTab as "annual" | "financial", true, {
      page: currentPage,
      limit: PAGE_SIZE,
    }),
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

  const baseUrl = `/${locale}/investor-relations/reports`;

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

      <ScrollReveal>
        {reports.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">{tIR("noReportsYet")}</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report, idx) => (
              <ScrollReveal key={report.id} delay={idx * 60}>
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {report.year}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-brand-deep dark:text-foreground">
                        {report.title}
                      </h3>
                      {report.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                      )}
                    </div>
                  </div>
                  <ReportActions
                    fileUrl={report.fileUrl}
                    title={report.title}
                    viewLabel={tIR("viewReport")}
                    downloadLabel={tIR("downloadReport")}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        <PaginationNav
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={baseUrl}
          extraParams={activeTab !== "annual" ? { tab: activeTab } : undefined}
        />
      </ScrollReveal>
    </>
  );
}
