import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { loadSolutionPageForAdmin } from "../_components/load-solution-page";
import { SolutionPageForm } from "../_components/solution-page-form";

export default async function TradingAdminPage() {
  const page = await loadSolutionPageForAdmin("trading");
  const t = await getTranslations("Admin.pages.trading");
  return (
    <div className="space-y-8">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <SolutionPageForm slug="trading" initial={page} showInquiryToggle />
    </div>
  );
}
