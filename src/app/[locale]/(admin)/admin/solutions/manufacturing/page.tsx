import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { loadSolutionPageForAdmin } from "../_components/load-solution-page";
import { SolutionPageForm } from "../_components/solution-page-form";

export default async function ManufacturingAdminPage() {
  const [page, locale, t] = await Promise.all([
    loadSolutionPageForAdmin("manufacturing"),
    getLocale(),
    getTranslations("Admin"),
  ]);
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("pages.manufacturing.title")}
        description={t("pages.manufacturing.description")}
        actions={
          <PreviewLink
            href={`/${locale}/solutions/manufacturing`}
            label={t("buttons.viewPublic")}
          />
        }
      />
      <SolutionPageForm slug="manufacturing" initial={page} showInquiryToggle />
    </div>
  );
}
