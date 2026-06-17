import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, localizedStringRequired, stripVersion } from "./_shared";

const reportSchema = new Schema(
  {
    title: localizedStringRequired,
    type: { type: String, enum: ["annual", "financial"], required: true, index: true },
    year: { type: Number, required: true, index: true },
    description: localizedStringOptional,
    fileUrl: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    isPublished: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type ReportDoc = InferSchemaType<typeof reportSchema>;
export type ReportType = "annual" | "financial";

if (process.env.NODE_ENV !== "production" && models.Report) {
  delete models.Report;
}

export const Report = models.Report ?? model("Report", reportSchema);
