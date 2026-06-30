import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, stripVersion } from "./_shared";
import { APPLICATION_STATUSES } from "./constants";

export type { ApplicationStatus } from "./constants";
export { APPLICATION_STATUSES };

const applicationSchema = new Schema(
  {
    // The opening applied to. `jobTitle` is a denormalized snapshot so the
    // application stays readable even if the opening is later edited or removed.
    jobOpeningId: { type: Schema.Types.ObjectId, ref: "JobOpening", index: true },
    jobTitle: localizedStringOptional,
    // System applicant fields (mirror APPLICATION_SYSTEM_KEYS).
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    // Uploaded CV (public GCS URL) + original filename for the admin label.
    cvUrl: { type: String, default: "" },
    cvFileName: { type: String, default: "" },
    // Admin-defined extra fields.
    customFieldValues: { type: Map, of: String, default: {} },
    // Hiring-pipeline status (independent of read/unread).
    status: { type: String, enum: APPLICATION_STATUSES, default: "new", index: true },
    read: { type: Boolean, default: false, index: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true, ...stripVersion },
);

export type ApplicationDoc = InferSchemaType<typeof applicationSchema>;

if (process.env.NODE_ENV !== "production" && models.Application) {
  delete models.Application;
}

export const Application = models.Application ?? model("Application", applicationSchema);
