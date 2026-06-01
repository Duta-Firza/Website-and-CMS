import { type InferSchemaType, model, models, Schema } from "mongoose";
import { stripVersion } from "./_shared";

const reachPointSchema = new Schema(
  {
    city: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type ReachPointDoc = InferSchemaType<typeof reachPointSchema>;

export const ReachPoint = models.ReachPoint ?? model("ReachPoint", reachPointSchema);
