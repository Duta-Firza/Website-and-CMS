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
    // /about (Who We Are) content
    intro: localizedStringOptional,
    videoUrl: { type: String, default: "" },
    videoAutoplay: { type: Boolean, default: false },
    vision: localizedStringOptional,
    mission: localizedStringOptional,
    values: { type: [valueItemSchema], default: [] },
    // /about/business sections
    coreBusinessTitle: localizedStringOptional,
    coreBusinessDescription: localizedStringOptional,
    affiliatedBusinessTitle: localizedStringOptional,
    affiliatedBusinessDescription: localizedStringOptional,
    holdingStructureLabel: localizedStringOptional,
    holdingGroupLabel: localizedStringOptional,
    holdingDivisions: { type: [holdingDivisionSchema], default: [] },
    // /about/leadership section labels
    boardOfDirectorsLabel: localizedStringOptional,
    boardOfCommissionersLabel: localizedStringOptional,
  },
  { timestamps: true, ...stripVersion },
);

export type AboutPageDoc = InferSchemaType<typeof aboutPageSchema>;

if (process.env.NODE_ENV !== "production" && models.AboutPage) {
  delete models.AboutPage;
}

export const AboutPage = models.AboutPage ?? model("AboutPage", aboutPageSchema);
