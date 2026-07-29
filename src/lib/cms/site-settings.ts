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

/** Manual-book PDF URLs (GCS) shown at /admin/manual-book. Empty = not uploaded. */
export async function getManualBookUrls(): Promise<{ id: string; en: string }> {
  await connectDB();
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID)
    .select("manualBookUrlId manualBookUrlEn")
    .lean<{ manualBookUrlId?: string; manualBookUrlEn?: string } | null>();
  return { id: doc?.manualBookUrlId ?? "", en: doc?.manualBookUrlEn ?? "" };
}

/** Store an uploaded manual-book PDF URL. Called from the dev upload route. */
export async function setManualBookUrl(lang: "id" | "en", url: string): Promise<void> {
  await connectDB();
  const field = lang === "en" ? "manualBookUrlEn" : "manualBookUrlId";
  // Update the existing singleton only (it is seeded with required fields; an
  // upsert-insert could create a doc missing those required fields).
  // `strict: false` guards against a stale/cached Mongoose model (e.g. dev HMR
  // compiled before these fields were added) silently stripping the update.
  await SiteSettings.updateOne(
    { _id: SITE_SETTINGS_ID },
    { $set: { [field]: url } },
    { strict: false },
  );
}
