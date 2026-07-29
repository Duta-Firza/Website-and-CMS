"use server";

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { ADMIN_SCOPES, USER_ROLES } from "@/models/constants";
import {
  type ActionResult,
  bust,
  errorMessage,
  getCurrentAdmin,
  requireSuperAdmin,
} from "./access";
import { countOtherActiveSuperAdmins, NOT_DELETED } from "./admin-users";

/**
 * User management. Every action here is super-admin only — user management is
 * the one place where `editor` must not reach, or an editor could promote
 * themselves.
 *
 * Cost 10 matches scripts/seed.ts; this is the only in-app hashing site.
 */
const BCRYPT_ROUNDS = 10;

/** First password rule in the codebase; matches the .env.example seed hint. */
const password = z.string().min(12, "Password must be at least 12 characters");

// `viewer` is intentionally accepted by the schema but hidden from the UI until
// the read-only surface exists — the server has always rejected it for writes.
const roleSchema = z.enum(USER_ROLES);
const scopesSchema = z.array(z.enum(ADMIN_SCOPES)).default([]);

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: roleSchema,
  scopes: scopesSchema,
  isActive: z.boolean().default(true),
  password,
});

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: roleSchema,
  scopes: scopesSchema,
  isActive: z.boolean().default(true),
});

async function emailTaken(email: string, exceptId?: string): Promise<boolean> {
  const found = await User.findOne({ ...NOT_DELETED, email: email.toLowerCase() })
    .select("_id")
    .lean<{ _id: unknown } | null>();
  return !!found && String(found._id) !== exceptId;
}

export async function createUser(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const data = createSchema.parse(input);
    await connectDB();

    // Checked up front so a duplicate surfaces as a real message rather than a
    // raw Mongo E11000 string in a toast.
    if (await emailTaken(data.email)) return { ok: false, error: "EMAIL_TAKEN" };

    await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role,
      scopes: data.role === "super-admin" ? [] : data.scopes,
      isActive: data.isActive,
      passwordHash: await bcrypt.hash(data.password, BCRYPT_ROUNDS),
    });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function updateUser(input: z.infer<typeof updateSchema>): Promise<ActionResult> {
  try {
    const me = await requireSuperAdmin();
    const data = updateSchema.parse(input);
    await connectDB();

    if (await emailTaken(data.email, data.id)) return { ok: false, error: "EMAIL_TAKEN" };

    const isSelf = data.id === me.id;
    if (isSelf && data.role !== "super-admin") return { ok: false, error: "CANNOT_DEMOTE_SELF" };
    if (isSelf && !data.isActive) return { ok: false, error: "CANNOT_DEACTIVATE_SELF" };

    // Losing super-admin (by demotion or deactivation) must never take the last
    // one with it, or nobody can administer the CMS again.
    const losesSuperAdmin = data.role !== "super-admin" || !data.isActive;
    if (losesSuperAdmin) {
      const target = await User.findById(data.id).select("role isActive").lean<{
        role?: string;
        isActive?: boolean;
      } | null>();
      if (!target) return { ok: false, error: "NOT_FOUND" };
      const wasActiveSuperAdmin = target.role === "super-admin" && target.isActive !== false;
      if (wasActiveSuperAdmin && (await countOtherActiveSuperAdmins(data.id)) === 0) {
        return { ok: false, error: "LAST_SUPER_ADMIN" };
      }
    }

    await User.findByIdAndUpdate(data.id, {
      $set: {
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        // A super-admin holds every scope implicitly; storing a list would only
        // go stale.
        scopes: data.role === "super-admin" ? [] : data.scopes,
        isActive: data.isActive,
      },
    });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

export async function toggleUserActive(id: string, value: boolean): Promise<ActionResult> {
  try {
    const me = await requireSuperAdmin();
    const parsed = z.object({ id: z.string().min(1), value: z.boolean() }).parse({ id, value });
    await connectDB();

    if (parsed.id === me.id) return { ok: false, error: "CANNOT_DEACTIVATE_SELF" };
    if (!parsed.value) {
      const target = await User.findById(parsed.id).select("role isActive").lean<{
        role?: string;
        isActive?: boolean;
      } | null>();
      if (!target) return { ok: false, error: "NOT_FOUND" };
      if (
        target.role === "super-admin" &&
        target.isActive !== false &&
        (await countOtherActiveSuperAdmins(parsed.id)) === 0
      ) {
        return { ok: false, error: "LAST_SUPER_ADMIN" };
      }
    }

    await User.findByIdAndUpdate(parsed.id, { $set: { isActive: parsed.value } });
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

const resetSchema = z.object({ id: z.string().min(1), password });

export async function resetUserPassword(input: z.infer<typeof resetSchema>): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const data = resetSchema.parse(input);
    await connectDB();
    const res = await User.findByIdAndUpdate(data.id, {
      $set: { passwordHash: await bcrypt.hash(data.password, BCRYPT_ROUNDS) },
    });
    if (!res) return { ok: false, error: "NOT_FOUND" };
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

/**
 * Soft delete: the document stays for audit/history. `email` is the only unique
 * field, so it gets a `deleted-<id>-` prefix to release it from the unique
 * index — the address becomes available for a new account immediately.
 */
export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const me = await requireSuperAdmin();
    const parsed = z.string().min(1).parse(id);
    await connectDB();

    if (parsed === me.id) return { ok: false, error: "CANNOT_DELETE_SELF" };

    const target = await User.findById(parsed).select("email role isActive").lean<{
      email?: string;
      role?: string;
      isActive?: boolean;
    } | null>();
    if (!target) return { ok: false, error: "NOT_FOUND" };

    if (
      target.role === "super-admin" &&
      target.isActive !== false &&
      (await countOtherActiveSuperAdmins(parsed)) === 0
    ) {
      return { ok: false, error: "LAST_SUPER_ADMIN" };
    }

    await User.updateOne(
      { _id: parsed },
      {
        $set: {
          email: `deleted-${randomUUID().slice(0, 8)}-${target.email ?? ""}`,
          isDeleted: true,
          isActive: false,
          deletedAt: new Date(),
        },
      },
    );
    bust();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: password,
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "PASSWORD_MISMATCH",
    path: ["confirmPassword"],
  });

/**
 * Self-service password change — available to any signed-in, active user
 * regardless of role or scope, since it only touches their own account.
 */
export async function changeMyPassword(
  input: z.infer<typeof changePasswordSchema>,
): Promise<ActionResult> {
  try {
    const me = await getCurrentAdmin();
    if (!me) return { ok: false, error: "UNAUTHORIZED" };
    const data = changePasswordSchema.parse(input);
    await connectDB();

    const doc = await User.findById(me.id).select("+passwordHash").lean<{
      passwordHash?: string;
    } | null>();
    if (!doc?.passwordHash) return { ok: false, error: "UNAUTHORIZED" };

    const valid = await bcrypt.compare(data.currentPassword, doc.passwordHash);
    if (!valid) return { ok: false, error: "CURRENT_PASSWORD_WRONG" };

    await User.findByIdAndUpdate(me.id, {
      $set: { passwordHash: await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS) },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}
