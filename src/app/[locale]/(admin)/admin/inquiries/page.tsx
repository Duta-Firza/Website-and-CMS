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
  notes: string;
  createdAt: string;
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
      status: InquiryStatus;
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
    status: d.status,
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
