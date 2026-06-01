import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringRequired, stripVersion } from "./_shared";

const partnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    summary: localizedStringRequired,
    websiteUrl: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    invertOnDark: { type: Boolean, default: false },
  },
  { timestamps: true, ...stripVersion },
);

export type PartnerDoc = InferSchemaType<typeof partnerSchema>;

export const Partner = models.Partner ?? model("Partner", partnerSchema);
