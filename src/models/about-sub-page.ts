import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, stripVersion } from "./_shared";
import { ABOUT_SUB_PAGE_SLUGS, ABOUT_SUB_PAGE_STATUSES } from "./constants";

export type { AboutSubPageSlug, AboutSubPageStatus } from "./constants";
export { ABOUT_SUB_PAGE_SLUGS, ABOUT_SUB_PAGE_STATUSES };

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

const aboutSubPageSchema = new Schema(
  {
    _id: { type: String, enum: ABOUT_SUB_PAGE_SLUGS, required: true },
    status: {
      type: String,
      enum: ABOUT_SUB_PAGE_STATUSES,
      default: "published",
      index: true,
    },
    hero: { type: heroSchema, default: () => ({}) },
    body: { type: bodySchema, default: () => ({}) },
  },
  { timestamps: true, ...stripVersion },
);

export type AboutSubPageDoc = InferSchemaType<typeof aboutSubPageSchema>;

if (process.env.NODE_ENV !== "production" && models.AboutSubPage) {
  delete models.AboutSubPage;
}

export const AboutSubPage = models.AboutSubPage ?? model("AboutSubPage", aboutSubPageSchema);
