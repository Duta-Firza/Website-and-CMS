import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, stripVersion } from "./_shared";
import { SOLUTION_PAGE_SLUGS, SOLUTION_PAGE_STATUSES } from "./constants";

export { SOLUTION_PAGE_SLUGS, SOLUTION_PAGE_STATUSES };
export type { SolutionPageSlug, SolutionPageStatus } from "./constants";

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

const solutionPageSchema = new Schema(
  {
    _id: { type: String, enum: SOLUTION_PAGE_SLUGS, required: true },
    status: {
      type: String,
      enum: SOLUTION_PAGE_STATUSES,
      default: "comingSoon",
      index: true,
    },
    hero: { type: heroSchema, default: () => ({}) },
    body: { type: bodySchema, default: () => ({}) },
    inquiryFormEnabled: { type: Boolean, default: true },
    comingSoonMessage: localizedStringOptional,
  },
  { timestamps: true, ...stripVersion },
);

export type SolutionPageDoc = InferSchemaType<typeof solutionPageSchema>;

export const SolutionPage = models.SolutionPage ?? model("SolutionPage", solutionPageSchema);
