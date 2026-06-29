import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, localizedStringRequired, stripVersion } from "./_shared";
import { JOB_EMPLOYMENT_TYPES } from "./constants";

export type { JobEmploymentType } from "./constants";
export { JOB_EMPLOYMENT_TYPES };

const jobOpeningSchema = new Schema(
  {
    title: localizedStringRequired,
    department: { type: String, default: "" },
    location: { type: String, default: "" },
    employmentType: { type: String, enum: JOB_EMPLOYMENT_TYPES, default: "fullTime", index: true },
    // Where "Apply" sends the candidate — an external ATS/job-board URL or a
    // `mailto:` address. Stored as a raw string so either works.
    applyUrl: { type: String, default: "" },
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
