import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, stripVersion } from "./_shared";
import { IR_SUB_PAGE_SLUGS, IR_SUB_PAGE_STATUSES, SECTION_MODES } from "./constants";

export type { IrSubPageSlug, IrSubPageStatus, SectionMode } from "./constants";
export { IR_SUB_PAGE_SLUGS, IR_SUB_PAGE_STATUSES, SECTION_MODES };

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

const irSubPageSchema = new Schema(
  {
    _id: { type: String, enum: IR_SUB_PAGE_SLUGS, required: true },
    status: {
      type: String,
      enum: IR_SUB_PAGE_STATUSES,
      default: "comingSoon",
      index: true,
    },
    heroMode: { type: String, enum: SECTION_MODES, default: "default" },
    bodyMode: { type: String, enum: SECTION_MODES, default: "disabled" },
    hero: { type: heroSchema, default: () => ({}) },
    body: { type: bodySchema, default: () => ({}) },
  },
  { timestamps: true, ...stripVersion },
);

export type IrSubPageDoc = InferSchemaType<typeof irSubPageSchema>;

if (process.env.NODE_ENV !== "production" && models.IrSubPage) {
  delete models.IrSubPage;
}

export const IrSubPage = models.IrSubPage ?? model("IrSubPage", irSubPageSchema);
