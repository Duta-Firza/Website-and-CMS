import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, localizedStringRequired, stripVersion } from "./_shared";
import { LEADERSHIP_TYPES, type LeadershipType } from "./constants";

export { LEADERSHIP_TYPES, type LeadershipType };

const leadershipMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    title: localizedStringRequired,
    bio: localizedStringOptional,
    photoUrl: { type: String, default: "" },
    type: { type: String, enum: LEADERSHIP_TYPES, required: true, index: true },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type LeadershipMemberDoc = InferSchemaType<typeof leadershipMemberSchema>;

export const LeadershipMember =
  models.LeadershipMember ?? model("LeadershipMember", leadershipMemberSchema);
