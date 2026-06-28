import { Settings2 } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { connectDB } from "@/lib/db";
import { ReportDownload, type ReportDownloadAction } from "@/models";
import { ReportDownloadInbox } from "./report-download-inbox";

export interface ReportLeadRow {
  id: string;
  reportTitle: string;
  reportType: "annual" | "financial" | "";
  reportYear: number | null;
  action: ReportDownloadAction;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  customFields: { key: string; value: string }[];
  read: boolean;
  notes: string;
  createdAt: string;
}

async function loadLeads(locale: string): Promise<ReportLeadRow[]> {
  await connectDB();
  const docs = await ReportDownload.find().sort({ createdAt: -1 }).lean<
    {
      _id: unknown;
      reportTitle?: { id?: string; en?: string };
      reportType?: "annual" | "financial";
      reportYear?: number;
      action?: ReportDownloadAction;
      fullName?: string;
      email?: string;
      phone?: string;
      company?: string;
      customFieldValues?: Record<string, string> | Map<string, string>;
      read?: boolean;
      notes?: string;
      createdAt: Date;
    }[]
  >();
  const en = locale === "en";
  return docs.map((d) => {
    const custom = d.customFieldValues
      ? d.customFieldValues instanceof Map
        ? Object.fromEntries(d.customFieldValues)
        : d.customFieldValues
      : {};
    return {
      id: String(d._id),
      reportTitle:
        (en ? d.reportTitle?.en : d.reportTitle?.id) ||
        d.reportTitle?.id ||
        d.reportTitle?.en ||
        "",
      reportType: d.reportType ?? "",
      reportYear: d.reportYear ?? null,
      action: d.action ?? "download",
      fullName: d.fullName ?? "",
      email: d.email ?? "",
      phone: d.phone ?? "",
      company: d.company ?? "",
      customFields: Object.entries(custom).map(([key, value]) => ({ key, value: String(value) })),
      read: d.read ?? false,
      notes: d.notes ?? "",
      createdAt: d.createdAt.toISOString(),
    };
  });
}

export default async function ReportDownloadsAdminPage() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Admin")]);
  const leads = await loadLeads(locale);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.reportDownloads.title")}
        description={t("pages.reportDownloads.description")}
        titleAction={
          <Link
            href={`/${locale}/admin/investor-relations/reports?tab=form`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            {t("reportLeads.formSettings")}
          </Link>
        }
      />
      <ReportDownloadInbox initial={leads} />
    </div>
  );
}
