import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringRequired, stripVersion } from "./_shared";

const statSchema = new Schema(
  {
    label: localizedStringRequired,
    prefix: { type: String, default: "" },
    value: { type: Number, required: true },
    suffix: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type StatDoc = InferSchemaType<typeof statSchema>;

export const Stat = models.Stat ?? model("Stat", statSchema);
