import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { connectDB } from "@/lib/db";
import { AffiliatedBusiness } from "@/models";
import { AboutSubPageForm } from "../_components/about-sub-page-form";
import { AboutSubPageShell } from "../_components/about-sub-page-shell";
import { loadAboutSubPageForAdmin } from "../_components/load-about-sub-page";
import { BusinessManager } from "./business-manager";

export interface AffiliatedBusinessRow {
  id: string;
  name: string;
  logoUrl: string;
  description: { id: string; en: string };
  websiteUrl: string;
  order: number;
}

async function loadBusinesses(): Promise<AffiliatedBusinessRow[]> {
  await connectDB();
  const docs = await AffiliatedBusiness.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    logoUrl: d.logoUrl ?? "",
    description: { id: d.description?.id ?? "", en: d.description?.en ?? "" },
    websiteUrl: d.websiteUrl ?? "",
    order: d.order ?? 0,
  }));
}

export default async function BusinessAdminPage() {
  const [businesses, meta, locale, t] = await Promise.all([
    loadBusinesses(),
    loadAboutSubPageForAdmin("business"),
    getLocale(),
    getTranslations("Admin"),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.business.title")}
        description={t("pages.business.description")}
        titleAction={
          <PreviewLink href={`/${locale}/about/business`} label={t("buttons.viewPublic")} />
        }
      />
      <AboutSubPageShell
        itemsLabelKey="tabs.businesses"
        contentTab={<AboutSubPageForm slug="business" initial={meta} />}
        itemsTab={<BusinessManager initial={businesses} />}
      />
    </div>
  );
}
