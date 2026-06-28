import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { UrlTabs } from "@/components/admin/url-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectDB } from "@/lib/db";
import { Report } from "@/models";
import type { ReportType } from "@/models/report";
import { IrSubPageForm } from "../_components/ir-sub-page-form";
import { loadIrSubPageForAdmin } from "../_components/load-ir-sub-page";
import { loadReportDownloadFormSettings } from "../_components/load-report-download-form";
import { ReportDownloadFormSettingsForm } from "./report-download-form";
import { ReportsManager } from "./reports-manager";

export interface ReportRow {
  id: string;
  title: { id: string; en: string };
  type: ReportType;
  year: number;
  description: { id: string; en: string };
  fileUrl: string;
  publishedAt: Date;
  isPublished: boolean;
  order: number;
}

async function loadReports(): Promise<ReportRow[]> {
  await connectDB();
  const docs = await Report.find().sort({ year: -1, order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: { id: d.title?.id ?? "", en: d.title?.en ?? "" },
    type: d.type as ReportType,
    year: d.year,
    description: { id: d.description?.id ?? "", en: d.description?.en ?? "" },
    fileUrl: d.fileUrl,
    publishedAt: d.publishedAt,
    isPublished: d.isPublished ?? true,
    order: d.order ?? 0,
  }));
}

export default async function ReportsAdminPage() {
  const [meta, reports, formSettings, locale, t] = await Promise.all([
    loadIrSubPageForAdmin("reports"),
    loadReports(),
    loadReportDownloadFormSettings(),
    getLocale(),
    getTranslations("Admin"),
  ]);

  const annual = reports.filter((r) => r.type === "annual");
  const financial = reports.filter((r) => r.type === "financial");
  const leadsHref = `/${locale}/admin/report-downloads`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.irReports.title")}
        description={t("pages.irReports.description")}
        titleAction={
          <PreviewLink
            href={`/${locale}/investor-relations/reports`}
            label={t("buttons.viewPublic")}
          />
        }
      />
      <UrlTabs
        defaultTab="content"
        validValues={["content", "annual", "financial", "form"]}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 md:w-fit">
          <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
          <TabsTrigger value="annual">{t("tabs.annual")}</TabsTrigger>
          <TabsTrigger value="financial">{t("tabs.financial")}</TabsTrigger>
          <TabsTrigger value="form">{t("tabs.downloadForm")}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-6">
          <IrSubPageForm slug="reports" initial={meta} />
        </TabsContent>
        <TabsContent value="annual" className="mt-6">
          <ReportsManager type="annual" initial={annual} />
        </TabsContent>
        <TabsContent value="financial" className="mt-6">
          <ReportsManager type="financial" initial={financial} />
        </TabsContent>
        <TabsContent value="form" className="mt-6">
          <ReportDownloadFormSettingsForm initial={formSettings} leadsHref={leadsHref} />
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
