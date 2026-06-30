import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, localizedStringRequired, stripVersion } from "./_shared";
import { JOB_APPLY_MODES, JOB_EMPLOYMENT_TYPES } from "./constants";

export type { JobApplyMode, JobEmploymentType } from "./constants";
export { JOB_APPLY_MODES, JOB_EMPLOYMENT_TYPES };

const jobOpeningSchema = new Schema(
  {
    title: localizedStringRequired,
    department: { type: String, default: "" },
    location: { type: String, default: "" },
    employmentType: { type: String, enum: JOB_EMPLOYMENT_TYPES, default: "fullTime", index: true },
    // How the public "Apply" button behaves: in-app form, external url, or email.
    applyMode: { type: String, enum: JOB_APPLY_MODES, default: "form" },
    // Used when applyMode === "url": external ATS/job-board link.
    applyUrl: { type: String, default: "" },
    // Used when applyMode === "email": destination address for `mailto:`.
    applyEmail: { type: String, default: "" },
    summary: localizedStringOptional,
    description: localizedStringOptional,
    isPublished: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0, index: true },
    postedAt: { type: Date, required: true },
  },
  { timestamps: true, ...stripVersion },
);

export type JobOpeningDoc = InferSchemaType<typeof jobOpeningSchema>;

if (process.env.NODE_ENV !== "production" && models.JobOpening) {
  delete models.JobOpening;
}

export const JobOpening = models.JobOpening ?? model("JobOpening", jobOpeningSchema);
