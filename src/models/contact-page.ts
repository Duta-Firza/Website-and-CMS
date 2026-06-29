import { type InferSchemaType, model, models, Schema } from "mongoose";
import { FORM_FIELD_TYPES } from "@/lib/cms/form-fields";
import { localizedStringOptional, stripVersion } from "./_shared";
import { PAGE_STATUSES, SECTION_MODES } from "./constants";

export const CONTACT_PAGE_ID = "contact";

const heroSchema = new Schema(
  {
    eyebrow: localizedStringOptional,
    title: localizedStringOptional,
    subtitle: localizedStringOptional,
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

// A physical location card. The address/hours/email come from SiteSettings
// (single source of truth shared with the footer); this only carries the
// page-specific Google Maps embed + "Get directions" link per location.
const locationSchema = new Schema(
  {
    mapEmbedUrl: { type: String, default: "" },
    directionsUrl: { type: String, default: "" },
  },
  { _id: false },
);

// Lead-capture contact form. Same shape as SolutionPage.formSettings so the
// admin form-builder UI + the public InquiryForm are fully reusable.
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

const contactPageSchema = new Schema(
  {
    _id: { type: String, default: CONTACT_PAGE_ID },
    status: { type: String, enum: PAGE_STATUSES, default: "published", index: true },
    heroMode: { type: String, enum: SECTION_MODES, default: "default" },
    bodyMode: { type: String, enum: SECTION_MODES, default: "disabled" },
    hero: { type: heroSchema, default: () => ({}) },
    body: { type: bodySchema, default: () => ({}) },
    office: { type: locationSchema, default: () => ({}) },
    factory: { type: locationSchema, default: () => ({}) },
    // Per-section visibility toggles — each block on the public page is hidden
    // when its flag is false.
    showMap: { type: Boolean, default: true },
    showFactory: { type: Boolean, default: true },
    showOfficeHours: { type: Boolean, default: true },
    showSocial: { type: Boolean, default: true },
    showDepartmentContacts: { type: Boolean, default: true },
    showCompanyProfile: { type: Boolean, default: true },
    showGetDirections: { type: Boolean, default: true },
    formSettings: { type: formSettingsSchema, default: () => ({}) },
  },
  { timestamps: true, ...stripVersion },
);

export type ContactPageDoc = InferSchemaType<typeof contactPageSchema>;

if (process.env.NODE_ENV !== "production" && models.ContactPage) {
  delete models.ContactPage;
}

export const ContactPage = models.ContactPage ?? model("ContactPage", contactPageSchema);
