import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { IrSubPageForm } from "../_components/ir-sub-page-form";
import { loadIrSubPageForAdmin } from "../_components/load-ir-sub-page";

export default async function PublicationsAdminPage() {
  const [meta, locale, t] = await Promise.all([
    loadIrSubPageForAdmin("publications"),
    getLocale(),
    getTranslations("Admin"),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.irPublications.title")}
        description={t("pages.irPublications.description")}
        titleAction={
          <PreviewLink
            href={`/${locale}/investor-relations/publications`}
            label={t("buttons.viewPublic")}
          />
        }
      />
      <IrSubPageForm slug="publications" initial={meta} />
    </div>
  );
}
