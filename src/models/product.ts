import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, stripVersion } from "./_shared";

// One principle entry in the row. Either linked to a Partner (`partnerId` set
// — `name` and `logoUrl` are then optional fallbacks) or fully manual.
const principleEntrySchema = new Schema(
  {
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner", default: null },
    name: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
  },
  { _id: false },
);

// One sub-product within the row (Pressure Gauge, Pressure Switch, ...).
const productItemSchema = new Schema(
  {
    name: localizedStringOptional,
    photos: { type: [String], default: [] },
  },
  { _id: false },
);

// Legacy single-principle override; kept so the runtime getter can fall back
// to old docs without a one-shot migration.
const legacyPrincipleOverrideSchema = new Schema(
  {
    name: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    origin: { type: String, default: "" },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    // New primary fields
    principles: { type: [principleEntrySchema], default: [] },
    origin: { type: String, default: "" },
    items: { type: [productItemSchema], default: [] },

    productType: localizedStringOptional,
    skuCount: { type: Number, default: 0 },
    partnershipStart: { type: Number, default: null },

    // Legacy single-principle fields — written by old admin form. Newer writes
    // don't touch them; getter reads them only when `principles`/`items` are
    // empty so existing docs keep rendering.
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner", default: null, index: true },
    principleOverride: { type: legacyPrincipleOverrideSchema, default: () => ({}) },
    photos: { type: [String], default: [] },

    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const Product = models.Product ?? model("Product", productSchema);
