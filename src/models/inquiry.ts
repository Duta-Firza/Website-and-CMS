import { type InferSchemaType, model, models, Schema } from "mongoose";
import { stripVersion } from "./_shared";
import { INQUIRY_SOURCES, INQUIRY_STATUSES } from "./constants";

export type { InquirySource, InquiryStatus } from "./constants";
export { INQUIRY_SOURCES, INQUIRY_STATUSES };

const inquirySchema = new Schema(
  {
    source: { type: String, enum: INQUIRY_SOURCES, required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: "", trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    websiteUrl: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
    customFieldValues: { type: Map, of: String, default: {} },
    status: { type: String, enum: INQUIRY_STATUSES, default: "new", index: true },
    // Read/unread is independent of the follow-up `status` so the unread badge
    // and the workflow triage don't fight each other.
    read: { type: Boolean, default: false, index: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true, ...stripVersion },
);

export type InquiryDoc = InferSchemaType<typeof inquirySchema>;

if (process.env.NODE_ENV !== "production" && models.Inquiry) {
  delete models.Inquiry;
}

export const Inquiry = models.Inquiry ?? model("Inquiry", inquirySchema);
