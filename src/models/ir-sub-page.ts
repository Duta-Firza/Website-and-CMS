import { type InferSchemaType, model, models, Schema } from "mongoose";
import { FORM_FIELD_TYPES } from "@/lib/cms/form-fields";
import { localizedStringOptional, stripVersion } from "./_shared";
import {
  IR_SUB_PAGE_SLUGS,
  IR_SUB_PAGE_STATUSES,
  SECTION_MODES,
  TABLE_COLUMN_ALIGNS,
} from "./constants";

export type { IrSubPageSlug, IrSubPageStatus, SectionMode, TableColumnAlign } from "./constants";
export { IR_SUB_PAGE_SLUGS, IR_SUB_PAGE_STATUSES, SECTION_MODES, TABLE_COLUMN_ALIGNS };

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

// Lead-capture gate form (currently used by the `reports` sub-page only). Same
// shape as SolutionPage.formSettings so the admin form-builder UI is reusable.
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

// Shareholder-composition table (currently used by the `stocks` sub-page only).
// Columns are admin-defined rather than fixed, so a cell addresses its column by
// `columnKey` instead of by position — deleting or reordering a column then
// can't shift every row's values into the wrong column.
const shareholderColumnSchema = new Schema(
  {
    key: { type: String, required: true },
    label: localizedStringOptional,
    align: { type: String, enum: TABLE_COLUMN_ALIGNS, default: "left" },
  },
  { _id: false },
);

const shareholderCellSchema = new Schema(
  {
    columnKey: { type: String, required: true },
    value: localizedStringOptional,
  },
  { _id: false },
);

const shareholderRowSchema = new Schema(
  {
    cells: { type: [shareholderCellSchema], default: [] },
    // Bold + top-rule styling on the public table. Because columns are dynamic
    // there's no total the system could compute, so an editor types the total
    // row by hand and flags it here.
    emphasis: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const shareholdersSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    heading: localizedStringOptional,
    note: localizedStringOptional,
    columns: { type: [shareholderColumnSchema], default: [] },
    rows: { type: [shareholderRowSchema], default: [] },
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
    formSettings: { type: formSettingsSchema, default: () => ({}) },
    shareholders: { type: shareholdersSchema, default: () => ({}) },
  },
  { timestamps: true, ...stripVersion },
);

export type IrSubPageDoc = InferSchemaType<typeof irSubPageSchema>;

if (process.env.NODE_ENV !== "production" && models.IrSubPage) {
  delete models.IrSubPage;
}

export const IrSubPage = models.IrSubPage ?? model("IrSubPage", irSubPageSchema);
