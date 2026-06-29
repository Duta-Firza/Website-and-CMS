import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { IrSubPageForm } from "../_components/ir-sub-page-form";
import { loadIrSubPageForAdmin } from "../_components/load-ir-sub-page";

export default async function StocksAdminPage() {
  const [meta, locale, t] = await Promise.all([
    loadIrSubPageForAdmin("stocks"),
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
      <IrSubPageForm slug="stocks" initial={meta} />
    </div>
  );
}
