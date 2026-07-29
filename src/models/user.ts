import { type InferSchemaType, model, models, Schema } from "mongoose";
import { stripVersion } from "./_shared";
import { ADMIN_SCOPES, USER_ROLES, type UserRole } from "./constants";

export { USER_ROLES, type UserRole };

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Never returned unless explicitly asked for (`.select("+passwordHash")`),
    // so listing users can't leak hashes. Only src/lib/auth.ts needs it.
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: USER_ROLES, default: "editor", required: true },
    // Which CMS sections this user may touch. Ignored for super-admins, who
    // implicitly hold every scope.
    scopes: { type: [String], enum: ADMIN_SCOPES, default: [] },
    isActive: { type: Boolean, default: true },
    // Users are soft-deleted: the doc stays, `email` gets a `deleted-<id>-`
    // prefix to release it from the unique index, and every read filters on
    // `{ isDeleted: { $ne: true } }` — never `false`, since docs predating this
    // field have no value at all.
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true, ...stripVersion },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: string };

// Drop the cached model on hot reload so schema edits actually apply in dev —
// without this, a stale registration keeps the old fields and `select` rules.
if (process.env.NODE_ENV !== "production" && models.User) {
  delete models.User;
}

export const User = models.User ?? model("User", userSchema);
