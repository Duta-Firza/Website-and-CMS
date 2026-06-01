import { connectDB } from "@/lib/db";
import { SITE_SETTINGS_ID, SiteSettings } from "@/models";
import { type Locale, localize } from "./localize";

export interface SiteSettingsData {
  contactEmail: string;
  salesEmail: string;
  phoneNumber: string;
  addressHO: string;
  addressFactory: string;
  officeHours: string;
  social: {
    linkedin: string;
    instagram: string;
    youtube: string;
  };
}

export async function getSiteSettings(locale: Locale): Promise<SiteSettingsData> {
  await connectDB();
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID).lean();
  if (!doc) {
    return {
      contactEmail: "info@dutafirza.com",
      salesEmail: "sales@dutafirza.com",
      phoneNumber: "",
      addressHO: "",
      addressFactory: "",
      officeHours: "",
      social: { linkedin: "", instagram: "", youtube: "" },
    };
  }
  return localize(
    {
      contactEmail: doc.contactEmail,
      salesEmail: doc.salesEmail,
      phoneNumber: doc.phoneNumber,
      addressHO: doc.addressHO,
      addressFactory: doc.addressFactory,
      officeHours: doc.officeHours,
      social: {
        linkedin: doc.social?.linkedin ?? "",
        instagram: doc.social?.instagram ?? "",
        youtube: doc.social?.youtube ?? "",
      },
    },
    locale,
  );
}
