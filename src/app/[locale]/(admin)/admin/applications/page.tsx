import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getUnreadApplicationCount } from "@/lib/cms/applications";
import { escapeRegex, parsePage, parsePageSize } from "@/lib/cms/list-query";
import { connectDB } from "@/lib/db";
import { APPLICATION_STATUSES, Application, type ApplicationStatus } from "@/models";
import { ApplicationsInbox } from "./_components/applications-inbox";

export interface ApplicationRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  cvUrl: string;
  cvFileName: string;
  customFields: { key: string; value: string }[];
  status: ApplicationStatus;
  read: boolean;
  notes: string;
  createdAt: string;
}

interface SearchParams {
  q?: string;
  status?: string;
  page?: string;
  pageSize?: string;
}

function buildQuery(q: string, status: string): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  const and: Record<string, unknown>[] = [];
  if (status === "unread") and.push({ read: { $ne: true } });
  else if (status !== "all") query.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    and.push({
      $or: [
        { firstName: rx },
        { lastName: rx },
        { email: rx },
        { "jobTitle.id": rx },
        { "jobTitle.en": rx },
      ],
    });
  }
  if (and.length > 0) query.$and = and;
  return query;
}

export default async function ApplicationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [sp, locale, t] = await Promise.all([
    searchParams,
    getLocale(),
    getTranslations("Admin.pages.applications"),
  ]);

  const q = (sp.q ?? "").trim();
  const validStatus =
    (APPLICATION_STATUSES as readonly string[]).includes(sp.status ?? "") || sp.status === "unread";
  const status = validStatus ? (sp.status as string) : "all";
  const pageSize = parsePageSize(sp.pageSize);
  const query = buildQuery(q, status);

  await connectDB();
  const [total, unreadCount] = await Promise.all([
    Application.countDocuments(query),
    getUnreadApplicationCount(),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(parsePage(sp.page), pageCount);

  const docs = await Application.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean<
      {
        _id: unknown;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        jobTitle?: { id?: string; en?: string };
        cvUrl?: string;
        cvFileName?: string;
        customFieldValues?: Record<string, string> | Map<string, string>;
        status?: string;
        read?: boolean;
        notes?: string;
        createdAt: Date;
      }[]
    >();

  const pick = (v?: { id?: string; en?: string }) =>
    (locale === "en" ? v?.en : v?.id) || v?.en || v?.id || "";

  const rows: ApplicationRow[] = docs.map((d) => {
    const custom =
      d.customFieldValues instanceof Map
        ? Object.fromEntries(d.customFieldValues)
        : (d.customFieldValues ?? {});
    return {
      id: String(d._id),
      firstName: d.firstName ?? "",
      lastName: d.lastName ?? "",
      email: d.email ?? "",
      phone: d.phone ?? "",
      jobTitle: pick(d.jobTitle),
      cvUrl: d.cvUrl ?? "",
      cvFileName: d.cvFileName ?? "",
      customFields: Object.entries(custom).map(([key, value]) => ({ key, value: String(value) })),
      status: (d.status ?? "new") as ApplicationStatus,
      read: d.read ?? false,
      notes: d.notes ?? "",
      createdAt: d.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <ApplicationsInbox
        rows={rows}
        total={total}
        unreadCount={unreadCount}
        q={q}
        status={status}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
