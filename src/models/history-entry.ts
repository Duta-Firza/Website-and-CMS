import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, localizedStringRequired, stripVersion } from "./_shared";

const historyEntrySchema = new Schema(
  {
    year: { type: String, required: true, trim: true },
    title: localizedStringRequired,
    description: localizedStringOptional,
    imageUrl: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type HistoryEntryDoc = InferSchemaType<typeof historyEntrySchema>;

export const HistoryEntry = models.HistoryEntry ?? model("HistoryEntry", historyEntrySchema);
