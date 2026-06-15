import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { loadSolutionPageForAdmin } from "../_components/load-solution-page";
import { SolutionPageForm } from "../_components/solution-page-form";

export default async function TradingAdminPage() {
  const [page, locale, t] = await Promise.all([
    loadSolutionPageForAdmin("trading"),
    getLocale(),
    getTranslations("Admin"),
  ]);
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("pages.trading.title")}
        description={t("pages.trading.description")}
        titleAction={
          <PreviewLink href={`/${locale}/solutions/trading`} label={t("buttons.viewPublic")} />
        }
      />
      <SolutionPageForm slug="trading" initial={page} showInquiryToggle />
    </div>
  );
}
