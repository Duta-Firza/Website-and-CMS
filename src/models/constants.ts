/**
 * Pure constants & types — safe to import from client components.
 * Do not import this file's parent (./index) from client code, since the
 * Mongoose models drag in Node-only deps (`tls`, `net`, etc.).
 */

export const PROJECT_CATEGORIES = ["trading", "manufacturing", "epc"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const SOLUTION_KEYS = ["trading", "manufacturing", "epc"] as const;
export type SolutionKey = (typeof SOLUTION_KEYS)[number];

export const USER_ROLES = ["super-admin", "editor", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const LEADERSHIP_TYPES = ["director", "commissioner"] as const;
export type LeadershipType = (typeof LEADERSHIP_TYPES)[number];

export const CREDENTIAL_TYPES = ["certification", "acknowledgement"] as const;
export type CredentialType = (typeof CREDENTIAL_TYPES)[number];

/**
 * Whitelist of lucide-react icon names that the Quick Stats card can render.
 * Both the admin Select dropdown and the public component pick from this list,
 * so adding a new icon means: install/verify it exists in our pinned
 * lucide-react bundle, push it here, and update the ICON_MAP in
 * quick-stats.tsx.
 */
export const STAT_ICONS = [
  "ChartBar",
  "CalendarClock",
  "Users",
  "Briefcase",
  "Award",
  "Building2",
  "Factory",
  "Wrench",
  "Globe",
  "TrendingUp",
] as const;
export type StatIcon = (typeof STAT_ICONS)[number];
