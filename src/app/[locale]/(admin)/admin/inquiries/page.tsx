import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { Inquiry, type InquirySource, type InquiryStatus } from "@/models";
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

// Legacy docs used a combined status enum (new/read/archived) with no `read`
// field. Map the old "read" status to read=true + workflow status "new", and
// derive read from status for archived docs that predate the `read` field.
function coerceStatus(raw: string | undefined): InquiryStatus {
  if (raw === "inProgress" || raw === "resolved" || raw === "archived") return raw;
  return "new";
}

async function loadInquiries(): Promise<InquiryRow[]> {
  await connectDB();
  const docs = await Inquiry.find().sort({ createdAt: -1 }).lean<
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
  return docs.map((d) => ({
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
}

export default async function InquiriesAdminPage() {
  const inquiries = await loadInquiries();
  const t = await getTranslations("Admin.pages.inquiries");
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <InquiryInbox initial={inquiries} />
    </div>
  );
}
