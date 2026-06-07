import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, stripVersion } from "./_shared";

const principleOverrideSchema = new Schema(
  {
    name: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    origin: { type: String, default: "" },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner", default: null, index: true },
    principleOverride: { type: principleOverrideSchema, default: () => ({}) },
    productType: localizedStringOptional,
    skuCount: { type: Number, default: 0 },
    partnershipStart: { type: Number, default: null },
    photos: { type: [String], default: [] },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const Product = models.Product ?? model("Product", productSchema);
