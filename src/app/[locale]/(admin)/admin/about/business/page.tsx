import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { UrlTabs } from "@/components/admin/url-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectDB } from "@/lib/db";
import { AboutPage, AffiliatedBusiness } from "@/models";
import { ABOUT_PAGE_ID } from "@/models/about-page";
import { AboutSubPageForm } from "../_components/about-sub-page-form";
import { AffiliatedHeaderCard } from "../_components/affiliated-header-card";
import { CoreBusinessCard } from "../_components/core-business-card";
import { HoldingDivisionsEditor } from "../_components/holding-divisions-editor";
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

export interface BusinessSections {
  coreBusinessTitle: { id: string; en: string };
  coreBusinessDescription: { id: string; en: string };
  affiliatedBusinessTitle: { id: string; en: string };
  affiliatedBusinessDescription: { id: string; en: string };
  holdingStructureLabel: { id: string; en: string };
  holdingGroupLabel: { id: string; en: string };
  holdingDivisions: { key: string; label: { id: string; en: string } }[];
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

async function loadBusinessSections(): Promise<BusinessSections> {
  await connectDB();
  const doc = await AboutPage.findById(ABOUT_PAGE_ID)
    .select(
      "coreBusinessTitle coreBusinessDescription affiliatedBusinessTitle affiliatedBusinessDescription holdingStructureLabel holdingGroupLabel holdingDivisions",
    )
    .lean();
  const localized = (v: { id?: string; en?: string } | undefined) => ({
    id: v?.id ?? "",
    en: v?.en ?? "",
  });
  return {
    coreBusinessTitle: localized(doc?.coreBusinessTitle),
    coreBusinessDescription: localized(doc?.coreBusinessDescription),
    affiliatedBusinessTitle: localized(doc?.affiliatedBusinessTitle),
    affiliatedBusinessDescription: localized(doc?.affiliatedBusinessDescription),
    holdingStructureLabel: localized(doc?.holdingStructureLabel),
    holdingGroupLabel: localized(doc?.holdingGroupLabel),
    holdingDivisions: (doc?.holdingDivisions ?? []).map(
      (d: { key: string; label?: { id?: string; en?: string } }) => ({
        key: d.key,
        label: localized(d.label),
      }),
    ),
  };
}

export default async function BusinessAdminPage() {
  const [businesses, meta, sections, locale, t] = await Promise.all([
    loadBusinesses(),
    loadAboutSubPageForAdmin("business"),
    loadBusinessSections(),
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
      <UrlTabs
        defaultTab="content"
        validValues={["content", "items", "holding"]}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 md:w-fit md:grid-cols-3">
          <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
          <TabsTrigger value="items">{t("tabs.businesses")}</TabsTrigger>
          <TabsTrigger value="holding">{t("tabs.holding")}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-6 space-y-6">
          <AboutSubPageForm slug="business" initial={meta} />
        </TabsContent>
        <TabsContent value="items" className="mt-6 space-y-6">
          <AffiliatedHeaderCard
            initial={{
              affiliatedBusinessTitle: sections.affiliatedBusinessTitle,
              affiliatedBusinessDescription: sections.affiliatedBusinessDescription,
            }}
          />
          <BusinessManager initial={businesses} />
        </TabsContent>
        <TabsContent value="holding" className="mt-6 space-y-6">
          <CoreBusinessCard
            initial={{
              coreBusinessTitle: sections.coreBusinessTitle,
              coreBusinessDescription: sections.coreBusinessDescription,
            }}
          />
          <HoldingDivisionsEditor
            initial={{
              holdingStructureLabel: sections.holdingStructureLabel,
              holdingGroupLabel: sections.holdingGroupLabel,
              holdingDivisions: sections.holdingDivisions,
            }}
          />
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
