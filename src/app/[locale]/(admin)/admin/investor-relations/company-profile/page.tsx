import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { UrlTabs } from "@/components/admin/url-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCompanyProfileUrl } from "@/lib/cms/investor-relations";
import { IrSubPageForm } from "../_components/ir-sub-page-form";
import { loadIrSubPageForAdmin } from "../_components/load-ir-sub-page";
import { CompanyProfileCard } from "./company-profile-card";

export default async function CompanyProfileAdminPage() {
  const [meta, profileUrl, locale, t] = await Promise.all([
    loadIrSubPageForAdmin("company-profile"),
    getCompanyProfileUrl(),
    getLocale(),
    getTranslations("Admin"),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.irCompanyProfile.title")}
        description={t("pages.irCompanyProfile.description")}
        titleAction={
          <PreviewLink
            href={`/${locale}/investor-relations/publications/company-profile`}
            label={t("buttons.viewPublic")}
          />
        }
      />
      <UrlTabs defaultTab="content" validValues={["content", "items"]} className="w-full">
        <TabsList className="grid grid-cols-2 md:w-fit">
          <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
          <TabsTrigger value="items">{t("tabs.items")}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-6">
          <IrSubPageForm slug="company-profile" initial={meta} />
        </TabsContent>
        <TabsContent value="items" className="mt-6">
          <CompanyProfileCard initial={profileUrl} />
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
