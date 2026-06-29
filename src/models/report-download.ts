import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, stripVersion } from "./_shared";
import { REPORT_DOWNLOAD_ACTIONS } from "./constants";

export type { ReportDownloadAction } from "./constants";
export { REPORT_DOWNLOAD_ACTIONS };

const reportDownloadSchema = new Schema(
  {
    // The report whose PDF was viewed/downloaded. `reportTitle`/`reportType`/
    // `reportYear` are denormalized snapshots so the lead stays readable even if
    // the report is later edited or removed.
    reportId: { type: Schema.Types.ObjectId, ref: "Report", index: true },
    reportTitle: localizedStringOptional,
    reportType: { type: String, enum: ["annual", "financial"] },
    reportYear: { type: Number },
    action: { type: String, enum: REPORT_DOWNLOAD_ACTIONS, default: "download", index: true },
    // System lead fields (mirror REPORT_DOWNLOAD_SYSTEM_KEYS).
    fullName: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    // Admin-defined extra fields.
    customFieldValues: { type: Map, of: String, default: {} },
    read: { type: Boolean, default: false, index: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true, ...stripVersion },
);

export type ReportDownloadDoc = InferSchemaType<typeof reportDownloadSchema>;

if (process.env.NODE_ENV !== "production" && models.ReportDownload) {
  delete models.ReportDownload;
}

export const ReportDownload =
  models.ReportDownload ?? model("ReportDownload", reportDownloadSchema);
