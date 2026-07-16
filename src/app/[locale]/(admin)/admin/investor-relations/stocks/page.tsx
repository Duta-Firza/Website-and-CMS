import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { UrlTabs } from "@/components/admin/url-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IrSubPageForm } from "../_components/ir-sub-page-form";
import { loadIrSubPageForAdmin } from "../_components/load-ir-sub-page";
import { loadStocksShareholders } from "./_components/load-stocks-shareholders";
import { ShareholdersForm } from "./_components/shareholders-form";
import { StocksBodyForm } from "./_components/stocks-body-form";

export default async function StocksAdminPage() {
  const [meta, shareholders, locale, t] = await Promise.all([
    loadIrSubPageForAdmin("stocks"),
    loadStocksShareholders(),
    getLocale(),
    getTranslations("Admin"),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.irStocks.title")}
        description={t("pages.irStocks.description")}
        titleAction={
          <PreviewLink
            href={`/${locale}/investor-relations/stocks`}
            label={t("buttons.viewPublic")}
          />
        }
      />
      <UrlTabs
        defaultTab="content"
        validValues={["content", "paragraph", "shareholders"]}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 md:w-fit">
          <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
          <TabsTrigger value="paragraph">{t("tabs.paragraph")}</TabsTrigger>
          <TabsTrigger value="shareholders">{t("tabs.shareholders")}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-6">
          <IrSubPageForm slug="stocks" initial={meta} includeBody={false} />
        </TabsContent>
        <TabsContent value="paragraph" className="mt-6">
          <StocksBodyForm initial={{ bodyMode: meta.bodyMode, body: meta.body }} />
        </TabsContent>
        <TabsContent value="shareholders" className="mt-6">
          <ShareholdersForm initial={shareholders} />
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
