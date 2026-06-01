import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringRequired, stripVersion } from "./_shared";
import { SOLUTION_KEYS, type SolutionKey } from "./constants";

export { SOLUTION_KEYS, type SolutionKey };

const solutionSchema = new Schema(
  {
    key: { type: String, enum: SOLUTION_KEYS, required: true, unique: true },
    title: localizedStringRequired,
    description: localizedStringRequired,
    iconName: { type: String, required: true, default: "Box" },
    href: { type: String, required: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type SolutionDoc = InferSchemaType<typeof solutionSchema>;

export const Solution = models.Solution ?? model("Solution", solutionSchema);
