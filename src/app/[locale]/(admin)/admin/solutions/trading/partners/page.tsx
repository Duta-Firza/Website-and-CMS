import { getLocale, getTranslations } from "next-intl/server";
import type { PartnerRow } from "@/app/[locale]/(admin)/admin/partners/page";
import { PartnersManager } from "@/app/[locale]/(admin)/admin/partners/partners-manager";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { connectDB } from "@/lib/db";
import { Partner } from "@/models";
import { loadSolutionPageForAdmin } from "../../_components/load-solution-page";
import { SolutionPageForm } from "../../_components/solution-page-form";

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

export default async function TradingPartnersAdminPage() {
  const [page, partners, locale, t] = await Promise.all([
    loadSolutionPageForAdmin("trading-partners"),
    loadPartners(),
    getLocale(),
    getTranslations("Admin"),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.tradingPartners.title")}
        description={t("pages.tradingPartners.description")}
        titleAction={
          <PreviewLink
            href={`/${locale}/solutions/trading/partners`}
            label={t("buttons.viewPublic")}
          />
        }
      />
      <SolutionPageForm
        slug="trading-partners"
        initial={page}
        additionalTabs={[
          {
            value: "partners",
            label: t("nouns.partner"),
            content: <PartnersManager initial={partners} />,
          },
        ]}
      />
    </div>
  );
}
