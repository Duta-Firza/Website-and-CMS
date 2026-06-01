import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringRequired, stripVersion } from "./_shared";
import { PROJECT_CATEGORIES, type ProjectCategory } from "./constants";

export { PROJECT_CATEGORIES, type ProjectCategory };

const projectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: localizedStringRequired,
    summary: localizedStringRequired,
    image: { type: String, required: true },
    client: { type: String, default: "" },
    year: { type: Number },
    category: { type: String, enum: PROJECT_CATEGORIES, required: true, index: true },
    isHighlighted: { type: Boolean, default: false, index: true },
    highlightOrder: { type: Number, default: 0 },
    order: { type: Number, default: 0, index: true },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, ...stripVersion },
);

projectSchema.index({ isHighlighted: 1, highlightOrder: 1 });

export type ProjectDoc = InferSchemaType<typeof projectSchema>;

export const Project = models.Project ?? model("Project", projectSchema);
