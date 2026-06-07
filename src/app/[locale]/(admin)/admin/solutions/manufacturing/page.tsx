import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { loadSolutionPageForAdmin } from "../_components/load-solution-page";
import { SolutionPageForm } from "../_components/solution-page-form";

export default async function ManufacturingAdminPage() {
  const page = await loadSolutionPageForAdmin("manufacturing");
  const t = await getTranslations("Admin.pages.manufacturing");
  return (
    <div className="space-y-8">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <SolutionPageForm slug="manufacturing" initial={page} showInquiryToggle />
    </div>
  );
}
