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
