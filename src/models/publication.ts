import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, localizedStringRequired, stripVersion } from "./_shared";

const publicationSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: ["newsroom", "press-release"], required: true, index: true },
    title: localizedStringRequired,
    summary: localizedStringOptional,
    body: localizedStringOptional,
    imageUrl: { type: String, default: "" },
    publishedAt: { type: Date, required: true },
    isPublished: { type: Boolean, default: false, index: true },
    originalUrl: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type PublicationDoc = InferSchemaType<typeof publicationSchema>;
export type PublicationCategory = "newsroom" | "press-release";

if (process.env.NODE_ENV !== "production" && models.Publication) {
  delete models.Publication;
}

export const Publication = models.Publication ?? model("Publication", publicationSchema);
