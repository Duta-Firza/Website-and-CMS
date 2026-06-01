import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringRequired, stripVersion } from "./_shared";

export const SITE_SETTINGS_ID = "site";

const socialSchema = new Schema(
  {
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  { _id: false },
);

const siteSettingsSchema = new Schema(
  {
    _id: { type: String, default: SITE_SETTINGS_ID },
    contactEmail: { type: String, required: true },
    salesEmail: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    addressHO: localizedStringRequired,
    addressFactory: localizedStringRequired,
    officeHours: localizedStringRequired,
    social: { type: socialSchema, default: () => ({}) },
  },
  { timestamps: true, ...stripVersion },
);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>;

export const SiteSettings = models.SiteSettings ?? model("SiteSettings", siteSettingsSchema);
