import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { Partner } from "@/models";
import { PartnersManager } from "./partners-manager";

export interface PartnerRow {
  id: string;
  name: string;
  logoUrl: string;
  summary: { id: string; en: string };
  websiteUrl: string;
  order: number;
  isActive: boolean;
  invertOnDark: boolean;
}

async function loadPartners(): Promise<PartnerRow[]> {
  await connectDB();
  const docs = await Partner.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    logoUrl: d.logoUrl,
    summary: { id: d.summary.id, en: d.summary.en },
    websiteUrl: d.websiteUrl ?? "",
    order: d.order ?? 0,
    isActive: d.isActive ?? true,
    invertOnDark: d.invertOnDark ?? false,
  }));
}

export default async function PartnersAdminPage() {
  const partners = await loadPartners();
  const t = await getTranslations("Admin.pages.partners");
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <PartnersManager initial={partners} />
    </div>
  );
}
