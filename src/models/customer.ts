import { type InferSchemaType, model, models, Schema } from "mongoose";
import { stripVersion } from "./_shared";

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    order: { type: Number, default: 0, index: true },
    invertOnDark: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, ...stripVersion },
);

export type CustomerDoc = InferSchemaType<typeof customerSchema>;

if (process.env.NODE_ENV !== "production" && models.Customer) {
  delete models.Customer;
}

export const Customer = models.Customer ?? model("Customer", customerSchema);
