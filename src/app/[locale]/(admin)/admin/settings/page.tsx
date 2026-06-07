import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getSiteSettings } from "@/lib/cms/site-settings";
import { connectDB } from "@/lib/db";
import { SITE_SETTINGS_ID, SiteSettings } from "@/models";
import { SettingsForm } from "./settings-form";

async function loadFullSettings() {
  await connectDB();
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID).lean();
  if (!doc) {
    return {
      contactEmail: "info@dutafirza.com",
      salesEmail: "sales@dutafirza.com",
      phoneNumber: "",
      addressHO: { id: "", en: "" },
      addressFactory: { id: "", en: "" },
      officeHours: { id: "", en: "" },
      social: { linkedin: "", instagram: "", youtube: "" },
    };
  }
  return {
    contactEmail: doc.contactEmail,
    salesEmail: doc.salesEmail,
    phoneNumber: doc.phoneNumber,
    addressHO: { id: doc.addressHO.id, en: doc.addressHO.en },
    addressFactory: { id: doc.addressFactory.id, en: doc.addressFactory.en },
    officeHours: { id: doc.officeHours.id, en: doc.officeHours.en },
    social: {
      linkedin: doc.social?.linkedin ?? "",
      instagram: doc.social?.instagram ?? "",
      youtube: doc.social?.youtube ?? "",
    },
  };
}

export default async function SettingsPage() {
  await getLocale(); // ensure request locale set
  const initial = await loadFullSettings();
  // Use the public-facing fetcher to confirm shape but pass raw localized for editing
  void (await getSiteSettings("id"));

  const t = await getTranslations("Admin.pages.settings");
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <SettingsForm initial={initial} />
    </div>
  );
}
