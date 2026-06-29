import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, stripVersion } from "./_shared";
import { PAGE_STATUSES, SECTION_MODES } from "./constants";

export const CAREER_PAGE_ID = "careers";

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

// External job-board link (LinkedIn / Seek / Jobstreet, or any custom board).
// `enabled` lets an admin hide a single board without deleting it.
const jobBoardSchema = new Schema(
  {
    key: { type: String, default: "" },
    label: localizedStringOptional,
    url: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
  },
  { _id: false },
);

// "Why join us" benefit/value card.
const benefitSchema = new Schema(
  {
    icon: { type: String, default: "Award" },
    title: localizedStringOptional,
    description: localizedStringOptional,
  },
  { _id: false },
);

const careerPageSchema = new Schema(
  {
    _id: { type: String, default: CAREER_PAGE_ID },
    status: { type: String, enum: PAGE_STATUSES, default: "published", index: true },
    heroMode: { type: String, enum: SECTION_MODES, default: "default" },
    bodyMode: { type: String, enum: SECTION_MODES, default: "disabled" },
    hero: { type: heroSchema, default: () => ({}) },
    body: { type: bodySchema, default: () => ({}) },
    // Job boards section
    showJobBoards: { type: Boolean, default: true },
    jobBoards: { type: [jobBoardSchema], default: [] },
    // Culture / "Why join us" section
    whyJoinMode: { type: String, enum: SECTION_MODES, default: "disabled" },
    whyJoin: { type: bodySchema, default: () => ({}) },
    showBenefits: { type: Boolean, default: true },
    benefits: { type: [benefitSchema], default: [] },
    // Open positions section (items live in the JobOpening collection)
    showOpenings: { type: Boolean, default: true },
  },
  { timestamps: true, ...stripVersion },
);

export type CareerPageDoc = InferSchemaType<typeof careerPageSchema>;

if (process.env.NODE_ENV !== "production" && models.CareerPage) {
  delete models.CareerPage;
}

export const CareerPage = models.CareerPage ?? model("CareerPage", careerPageSchema);
