import { Settings2 } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { escapeRegex, parsePage, parsePageSize } from "@/lib/cms/list-query";
import { connectDB } from "@/lib/db";
import { REPORT_DOWNLOAD_ACTIONS, ReportDownload, type ReportDownloadAction } from "@/models";
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

interface SearchParams {
  q?: string;
  filter?: string;
  type?: string;
  page?: string;
  pageSize?: string;
}

function buildQuery(q: string, filter: string, type: string): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (filter === "unread") query.read = false;
  else if (filter !== "all") query.action = filter;
  if (type !== "all") query.reportType = type;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    query.$or = [
      { company: rx },
      { fullName: rx },
      { email: rx },
      { "reportTitle.id": rx },
      { "reportTitle.en": rx },
    ];
  }
  return query;
}

export default async function ReportDownloadsAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [locale, t, sp] = await Promise.all([getLocale(), getTranslations("Admin"), searchParams]);

  const q = (sp.q ?? "").trim();
  const filter =
    sp.filter === "unread" ||
    (REPORT_DOWNLOAD_ACTIONS as readonly string[]).includes(sp.filter ?? "")
      ? (sp.filter as string)
      : "all";
  const type = sp.type === "annual" || sp.type === "financial" ? sp.type : "all";
  const pageSize = parsePageSize(sp.pageSize);
  const query = buildQuery(q, filter, type);

  await connectDB();
  const [total, unreadCount] = await Promise.all([
    ReportDownload.countDocuments(query),
    ReportDownload.countDocuments({ read: false }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(parsePage(sp.page), pageCount);

  const docs = await ReportDownload.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean<
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
  const rows: ReportLeadRow[] = docs.map((d) => {
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
      <ReportDownloadInbox
        rows={rows}
        total={total}
        unreadCount={unreadCount}
        q={q}
        filter={filter}
        type={type}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
