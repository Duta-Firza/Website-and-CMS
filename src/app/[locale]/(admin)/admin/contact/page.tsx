import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { ContactAdminTabs } from "./_components/contact-admin-tabs";
import { loadContactInfo } from "./_components/load-contact-info";
import { loadContactPageForAdmin } from "./_components/load-contact-page";

export default async function ContactAdminPage() {
  const [pageInitial, infoInitial, locale, t] = await Promise.all([
    loadContactPageForAdmin(),
    loadContactInfo(),
    getLocale(),
    getTranslations("Admin"),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.contact.title")}
        description={t("pages.contact.description")}
        titleAction={<PreviewLink href={`/${locale}/contact`} label={t("buttons.viewPublic")} />}
      />
      <ContactAdminTabs pageInitial={pageInitial} infoInitial={infoInitial} />
    </div>
  );
}
