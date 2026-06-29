import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { loadSolutionPageForAdmin } from "../_components/load-solution-page";
import { SolutionPageForm } from "../_components/solution-page-form";

export default async function TechnologyAdminPage() {
  const [page, locale, t] = await Promise.all([
    loadSolutionPageForAdmin("technology"),
    getLocale(),
    getTranslations("Admin"),
  ]);
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("pages.technology.title")}
        description={t("pages.technology.description")}
        titleAction={
          <PreviewLink href={`/${locale}/solutions/technology`} label={t("buttons.viewPublic")} />
        }
      />
      <SolutionPageForm slug="technology" initial={page} showInquiryToggle showWebsiteTab />
    </div>
  );
}
