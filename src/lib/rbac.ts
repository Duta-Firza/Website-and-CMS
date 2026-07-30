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
 * Leaf scopes grouped under their section, for the "Section access" picker in
 * the user form. `titleKey` and each scope both resolve against the `AdminNav`
 * message namespace (scope id == its nav label key), so the picker always reads
 * the same names as the sidebar. Order and grouping mirror the nav.
 */
export interface AdminScopeGroup {
  /** Stable key for React lists / the group checkbox id. */
  key: string;
  /** `AdminNav` message key for the section header. */
  titleKey: string;
  scopes: AdminScope[];
}

export const ADMIN_SCOPE_GROUPS: AdminScopeGroup[] = [
  { key: "analytics", titleKey: "sectionAnalytics", scopes: ["visitorAnalytics"] },
  { key: "home", titleKey: "groupHome", scopes: ["landing"] },
  {
    key: "about",
    titleKey: "groupAbout",
    scopes: ["about", "leadership", "history", "business", "credentials"],
  },
  {
    key: "solutions",
    titleKey: "groupSolutions",
    scopes: ["trading", "tradingPartners", "tradingProducts", "manufacturing", "epc", "technology"],
  },
  {
    key: "investorRelations",
    titleKey: "groupInvestorRelations",
    scopes: ["stocks", "reports", "publications", "pressRelease", "newsroom", "companyProfile"],
  },
  { key: "contact", titleKey: "groupConnect", scopes: ["contactInfo", "careers"] },
  {
    key: "inbox",
    titleKey: "groupInbox",
    scopes: ["inquiries", "applications", "reportDownloads"],
  },
];
