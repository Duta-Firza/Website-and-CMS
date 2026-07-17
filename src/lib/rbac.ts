import type { AdminScope, UserRole } from "@/models/constants";

/**
 * Pure RBAC predicates — safe to import from client components. Imports types
 * from @/models/constants (client-safe) and never from @/models, which would
 * drag Mongoose into the browser bundle.
 */

/** Scope-shaped slots a nav group or item can declare. */
export type NavScope = AdminScope | "system";

export interface AdminAccess {
  role: UserRole;
  scopes: AdminScope[];
}

/** Super-admins hold every scope implicitly; the stored list is ignored. */
export function canAccess(access: AdminAccess, scope: NavScope | null): boolean {
  if (scope === null) return true; // ungated (dashboard)
  if (access.role === "super-admin") return true;
  if (scope === "system") return false; // user management is super-admin only
  return access.scopes.includes(scope);
}

/** Viewers are read-only everywhere they can see. */
export function canWrite(role: UserRole): boolean {
  return role !== "viewer";
}

/**
 * Scope -> key in the `AdminNav` message namespace. Reuses the sidebar's own
 * labels so a section can't be named one thing in the nav and another in the
 * permission picker.
 */
export const SCOPE_LABEL_KEYS: Record<AdminScope, string> = {
  analytics: "visitorAnalytics",
  home: "groupHome",
  about: "groupAbout",
  solutions: "groupSolutions",
  investorRelations: "groupInvestorRelations",
  contact: "groupConnect",
  inbox: "groupInbox",
};
