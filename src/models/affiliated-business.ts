import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, stripVersion } from "./_shared";

const affiliatedBusinessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: "" },
    description: localizedStringOptional,
    websiteUrl: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type AffiliatedBusinessDoc = InferSchemaType<typeof affiliatedBusinessSchema>;

export const AffiliatedBusiness =
  models.AffiliatedBusiness ?? model("AffiliatedBusiness", affiliatedBusinessSchema);
