import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { cache } from "react";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { type AdminAccess, canAccess, type NavScope } from "@/lib/rbac";
import { User } from "@/models";
import type { AdminScope, UserRole } from "@/models/constants";

/**
 * Server-side authorization. Deliberately NOT a `"use server"` module: such a
 * file may only export async functions, and `bust`/`errorMessage` are sync.
 *
 * Every check re-reads the user from MongoDB rather than trusting the JWT, so
 * deactivating a user, changing their role, or editing their scopes takes
 * effect on their very next request instead of whenever the token expires.
 */

export interface CurrentAdmin extends AdminAccess {
  id: string;
  name: string;
  email: string;
}

/**
 * Uncached read. Use this inside long-lived requests (the SSE streams), where a
 * per-request cache would pin the result for the life of the connection.
 */
export async function loadCurrentAdmin(): Promise<CurrentAdmin | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  await connectDB();
  const doc = await User.findById(id).select("name email role scopes isActive isDeleted").lean<{
    _id: unknown;
    name?: string;
    email?: string;
    role?: UserRole;
    scopes?: AdminScope[];
    isActive?: boolean;
    isDeleted?: boolean;
  } | null>();

  // `isDeleted !== false` would be wrong: docs predating the field have no value.
  if (!doc || doc.isDeleted === true || doc.isActive === false) return null;

  return {
    id: String(doc._id),
    name: doc.name ?? "",
    email: doc.email ?? "",
    role: doc.role ?? "editor",
    scopes: doc.scopes ?? [],
  };
}

/**
 * Request-scoped memo of {@link loadCurrentAdmin} — collapses the layout,
 * sidebar and page all needing the current user into one query per render.
 */
export const getCurrentAdmin = cache(loadCurrentAdmin);

/** Guard for server actions. Throws the strings the action try/catch surfaces. */
export async function requireAdmin(scope: NavScope): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  if (admin.role === "viewer") throw new Error("FORBIDDEN");
  if (!canAccess(admin, scope)) throw new Error("FORBIDDEN");
  return admin;
}

/** Guard for any authenticated, active, non-viewer user (e.g. media upload). */
export async function requireWriteAccess(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  if (admin.role === "viewer") throw new Error("FORBIDDEN");
  return admin;
}

/** Guard for user management. */
export async function requireSuperAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  if (admin.role !== "super-admin") throw new Error("FORBIDDEN");
  return admin;
}

/**
 * Guard for admin pages. Must be called by the page itself, not only a layout:
 * soft-navigating between routes reuses the layout without re-running it, while
 * the page segment always executes on the server.
 *
 * Redirects rather than calling forbidden()/unauthorized(), which need
 * `experimental.authInterrupts` (not enabled in next.config.ts).
 */
export async function requirePageScope(scope: NavScope | null): Promise<CurrentAdmin> {
  const [admin, locale] = await Promise.all([getCurrentAdmin(), getLocale()]);
  if (!admin) redirect(`/${locale}/admin/login?reason=revoked`);
  if (!canAccess(admin, scope)) redirect(`/${locale}/admin`);
  return admin;
}

export function bust() {
  revalidatePath("/", "layout");
}

export type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };

export function errorMessage(e: unknown): string {
  if (e instanceof z.ZodError) return e.issues.map((i) => i.message).join("; ");
  if (e instanceof Error) return e.message;
  return "Unknown error";
}
