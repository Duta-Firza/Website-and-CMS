import { type InferSchemaType, model, models, Schema } from "mongoose";
import { stripVersion } from "./_shared";
import { USER_ROLES, type UserRole } from "./constants";

export { USER_ROLES, type UserRole };

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: USER_ROLES, default: "editor", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, ...stripVersion },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: string };

export const User = models.User ?? model("User", userSchema);
