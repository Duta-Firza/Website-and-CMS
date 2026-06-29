import { connectDB } from "@/lib/db";
import { CONTACT_PAGE_ID, ContactPage, SITE_SETTINGS_ID, SiteSettings } from "@/models";
import type { ContactInfoFormValues } from "./contact-info-form";

/**
 * Load the Info Kontak tab editor state: raw (un-localized) SiteSettings plus the
 * ContactPage display toggles (saved together by ContactInfoForm).
 */
export async function loadContactInfo(): Promise<ContactInfoFormValues> {
  await connectDB();
  const [settings, page] = await Promise.all([
    SiteSettings.findById(SITE_SETTINGS_ID).lean(),
    ContactPage.findById(CONTACT_PAGE_ID)
      .select("showSocial showDepartmentContacts showCompanyProfile")
      .lean<{
        showSocial?: boolean;
        showDepartmentContacts?: boolean;
        showCompanyProfile?: boolean;
      } | null>(),
  ]);

  return {
    contactEmail: settings?.contactEmail ?? "info@dutafirza.com",
    salesEmail: settings?.salesEmail ?? "sales@dutafirza.com",
    phoneNumber: settings?.phoneNumber ?? "",
    addressHO: { id: settings?.addressHO?.id ?? "", en: settings?.addressHO?.en ?? "" },
    addressFactory: {
      id: settings?.addressFactory?.id ?? "",
      en: settings?.addressFactory?.en ?? "",
    },
    officeHours: { id: settings?.officeHours?.id ?? "", en: settings?.officeHours?.en ?? "" },
    social: {
      linkedin: settings?.social?.linkedin ?? "",
      instagram: settings?.social?.instagram ?? "",
      youtube: settings?.social?.youtube ?? "",
    },
    showDepartmentContacts: page?.showDepartmentContacts ?? true,
    showSocial: page?.showSocial ?? true,
    showCompanyProfile: page?.showCompanyProfile ?? true,
  };
}
