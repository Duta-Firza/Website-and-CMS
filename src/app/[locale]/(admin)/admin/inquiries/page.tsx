import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getUnreadInquiryCount } from "@/lib/cms/inquiries";
import { escapeRegex, parsePage, parsePageSize } from "@/lib/cms/list-query";
import { connectDB } from "@/lib/db";
import { INQUIRY_SOURCES, Inquiry, type InquirySource, type InquiryStatus } from "@/models";
import { InquiryInbox } from "./inquiry-inbox";

export interface InquiryRow {
  id: string;
  source: InquirySource;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  websiteUrl: string;
  country: string;
  message: string;
  status: InquiryStatus;
  read: boolean;
  notes: string;
  createdAt: string;
}

interface SearchParams {
  q?: string;
  source?: string;
  status?: string;
  page?: string;
  pageSize?: string;
}

// Legacy docs used a combined status enum (new/read/archived) with no `read`
// field. Map the old "read" status to read=true + workflow status "new", and
// derive read from status for archived docs that predate the `read` field.
function coerceStatus(raw: string | undefined): InquiryStatus {
  if (raw === "inProgress" || raw === "resolved" || raw === "archived") return raw;
  return "new";
}

function buildQuery(q: string, source: string, status: string): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (source !== "all") query.source = source;
  const and: Record<string, unknown>[] = [];
  if (status === "unread") {
    // Match the legacy coercion: unread = read:false, or predates the field and
    // its (legacy) status isn't "read"/"archived".
    and.push({
      $or: [{ read: false }, { read: { $exists: false }, status: { $nin: ["read", "archived"] } }],
    });
  } else if (status !== "all") {
    query.status = status;
  }
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    and.push({
      $or: [{ company: rx }, { firstName: rx }, { lastName: rx }, { email: rx }, { message: rx }],
    });
  }
  if (and.length > 0) query.$and = and;
  return query;
}

export default async function InquiriesAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [sp, t] = await Promise.all([searchParams, getTranslations("Admin.pages.inquiries")]);

  const q = (sp.q ?? "").trim();
  const source = (INQUIRY_SOURCES as readonly string[]).includes(sp.source ?? "")
    ? (sp.source as InquirySource)
    : "all";
  const status = sp.status ?? "all";
  const pageSize = parsePageSize(sp.pageSize);
  const query = buildQuery(q, source, status);

  await connectDB();
  const [total, unreadCount] = await Promise.all([
    Inquiry.countDocuments(query),
    getUnreadInquiryCount(),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(parsePage(sp.page), pageCount);

  const docs = await Inquiry.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean<
      {
        _id: unknown;
        source: InquirySource;
        firstName: string;
        lastName?: string;
        email: string;
        company: string;
        phone?: string;
        websiteUrl?: string;
        country?: string;
        message: string;
        status?: string;
        read?: boolean;
        notes?: string;
        createdAt: Date;
      }[]
    >();

  const rows: InquiryRow[] = docs.map((d) => ({
    id: String(d._id),
    source: d.source,
    firstName: d.firstName,
    lastName: d.lastName ?? "",
    email: d.email,
    company: d.company,
    phone: d.phone ?? "",
    websiteUrl: d.websiteUrl ?? "",
    country: d.country ?? "",
    message: d.message,
    status: coerceStatus(d.status),
    read: d.read ?? (d.status === "read" || d.status === "archived"),
    notes: d.notes ?? "",
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <InquiryInbox
        rows={rows}
        total={total}
        unreadCount={unreadCount}
        q={q}
        source={source}
        status={status}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
