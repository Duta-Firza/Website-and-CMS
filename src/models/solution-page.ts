import { type InferSchemaType, model, models, Schema } from "mongoose";
import { FORM_FIELD_TYPES } from "@/lib/cms/form-fields";
import { localizedStringOptional, stripVersion } from "./_shared";
import { SECTION_MODES, SOLUTION_PAGE_SLUGS, SOLUTION_PAGE_STATUSES } from "./constants";

export type { SolutionPageSlug, SolutionPageStatus } from "./constants";
export { SOLUTION_PAGE_SLUGS, SOLUTION_PAGE_STATUSES };

const heroSchema = new Schema(
  {
    eyebrow: localizedStringOptional,
    title: localizedStringOptional,
    subtitle: localizedStringOptional,
    backgroundImage: { type: String, default: "" },
  },
  { _id: false },
);

const bodySchema = new Schema(
  {
    heading: localizedStringOptional,
    content: localizedStringOptional,
  },
  { _id: false },
);

const formFieldOptionSchema = new Schema(
  {
    value: { type: String, required: true },
    label: localizedStringOptional,
  },
  { _id: false },
);

const formFieldSchema = new Schema(
  {
    key: { type: String, required: true },
    label: localizedStringOptional,
    placeholder: localizedStringOptional,
    type: { type: String, enum: FORM_FIELD_TYPES, default: "text" },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    options: { type: [formFieldOptionSchema], default: [] },
  },
  { _id: false },
);

const formSettingsSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    submitLabel: localizedStringOptional,
    successMessage: localizedStringOptional,
    fields: { type: [formFieldSchema], default: [] },
  },
  { _id: false },
);

// External website link (e.g. the Duta Firza Technologies site) rendered as a
// CTA on the public page. The URL is locale-agnostic; the copy is localized.
// Only surfaced in the admin editor for pages that opt in (the technology page).
const websiteLinkSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    url: { type: String, default: "" },
    title: localizedStringOptional,
    description: localizedStringOptional,
    ctaLabel: localizedStringOptional,
  },
  { _id: false },
);

const solutionPageSchema = new Schema(
  {
    _id: { type: String, enum: SOLUTION_PAGE_SLUGS, required: true },
    status: {
      type: String,
      enum: SOLUTION_PAGE_STATUSES,
      default: "comingSoon",
      index: true,
    },
    heroMode: { type: String, enum: SECTION_MODES, default: "default" },
    bodyMode: { type: String, enum: SECTION_MODES, default: "default" },
    hero: { type: heroSchema, default: () => ({}) },
    body: { type: bodySchema, default: () => ({}) },
    // Legacy flag kept for backward compat on existing docs; `formSettings.enabled`
    // is the new source of truth.
    inquiryFormEnabled: { type: Boolean, default: true },
    formSettings: { type: formSettingsSchema, default: () => ({}) },
    comingSoonMessage: localizedStringOptional,
    websiteLink: { type: websiteLinkSchema, default: () => ({}) },
    // WhatsApp chat config (used by the trading-products page). `whatsappNumber`
    // is the destination in international digits-only format; an empty value
    // disables the public chat button. `whatsappTemplate` is the global default
    // message, with `{product}` as a placeholder for the product name.
    whatsappNumber: { type: String, default: "" },
    whatsappTemplate: localizedStringOptional,
  },
  { timestamps: true, ...stripVersion },
);

export type SolutionPageDoc = InferSchemaType<typeof solutionPageSchema>;

if (process.env.NODE_ENV !== "production" && models.SolutionPage) {
  delete models.SolutionPage;
}

export const SolutionPage = models.SolutionPage ?? model("SolutionPage", solutionPageSchema);
