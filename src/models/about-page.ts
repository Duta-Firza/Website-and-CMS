import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, localizedStringSchema, stripVersion } from "./_shared";

export const ABOUT_PAGE_ID = "about-page";

const valueItemSchema = new Schema(
  {
    title: { type: localizedStringSchema, default: () => ({ id: "", en: "" }) },
    description: { type: localizedStringSchema, default: () => ({ id: "", en: "" }) },
  },
  { _id: false },
);

const holdingDivisionSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: localizedStringSchema, default: () => ({ id: "", en: "" }) },
  },
  { _id: false },
);

const aboutPageSchema = new Schema(
  {
    _id: { type: String, default: ABOUT_PAGE_ID },
    intro: localizedStringOptional,
    videoUrl: { type: String, default: "" },
    vision: localizedStringOptional,
    mission: localizedStringOptional,
    values: { type: [valueItemSchema], default: [] },
    coreBusinessTitle: localizedStringOptional,
    coreBusinessDescription: localizedStringOptional,
    affiliatedBusinessTitle: localizedStringOptional,
    affiliatedBusinessDescription: localizedStringOptional,
    // Page title overrides — when non-empty, render in place of i18n default
    whoWeAreTitle: localizedStringOptional,
    leadershipTitle: localizedStringOptional,
    historyTitle: localizedStringOptional,
    businessTitle: localizedStringOptional,
    credentialsTitle: localizedStringOptional,
    // Business-page label overrides
    holdingStructureLabel: localizedStringOptional,
    holdingGroupLabel: localizedStringOptional,
    // Leadership-page section labels
    boardOfDirectorsLabel: localizedStringOptional,
    boardOfCommissionersLabel: localizedStringOptional,
    // Holding diagram divisions (replaces hardcoded epc/trading/manufacturing)
    holdingDivisions: { type: [holdingDivisionSchema], default: [] },
  },
  { timestamps: true, ...stripVersion },
);

export type AboutPageDoc = InferSchemaType<typeof aboutPageSchema>;

export const AboutPage = models.AboutPage ?? model("AboutPage", aboutPageSchema);
