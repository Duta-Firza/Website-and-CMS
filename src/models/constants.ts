/**
 * Pure constants & types — safe to import from client components.
 * Do not import this file's parent (./index) from client code, since the
 * Mongoose models drag in Node-only deps (`tls`, `net`, etc.).
 */

export const PROJECT_CATEGORIES = ["trading", "manufacturing", "epc"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const SOLUTION_KEYS = ["trading", "manufacturing", "epc", "technology"] as const;
export type SolutionKey = (typeof SOLUTION_KEYS)[number];

export const USER_ROLES = ["super-admin", "editor", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const LEADERSHIP_TYPES = ["director", "commissioner"] as const;
export type LeadershipType = (typeof LEADERSHIP_TYPES)[number];

export const CREDENTIAL_TYPES = ["certification", "acknowledgement"] as const;
export type CredentialType = (typeof CREDENTIAL_TYPES)[number];

export const SOLUTION_PAGE_SLUGS = [
  "solutions",
  "trading",
  "trading-partners",
  "trading-products",
  "manufacturing",
  "epc",
  "technology",
] as const;
export type SolutionPageSlug = (typeof SOLUTION_PAGE_SLUGS)[number];

export const SOLUTION_PAGE_STATUSES = ["published", "comingSoon", "hidden"] as const;
export type SolutionPageStatus = (typeof SOLUTION_PAGE_STATUSES)[number];

export const INQUIRY_SOURCES = [
  "trading",
  "manufacturing",
  "epc",
  "technology",
  "contact",
] as const;
export type InquirySource = (typeof INQUIRY_SOURCES)[number];

// Follow-up workflow status for an inquiry. Read/unread is tracked separately
// via the Inquiry `read` boolean, so these values are purely about triage.
export const INQUIRY_STATUSES = ["new", "inProgress", "resolved", "archived"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

// Whether a report lead came from a "view" (opened the in-browser preview) or a
// "download" of the PDF. Stored on the ReportDownload model so admins can tell
// the two intents apart in the Download Reports inbox.
export const REPORT_DOWNLOAD_ACTIONS = ["view", "download"] as const;
export type ReportDownloadAction = (typeof REPORT_DOWNLOAD_ACTIONS)[number];

// How a report's public thumbnail is sourced:
// - upload       → admin uploaded a custom image (thumbnailUrl)
// - pdfFirstPage → generated from the first page of the report PDF (thumbnailUrl)
// - default      → no image; the public page falls back to a placeholder
export const REPORT_THUMBNAIL_MODES = ["upload", "pdfFirstPage", "default"] as const;
export type ReportThumbnailMode = (typeof REPORT_THUMBNAIL_MODES)[number];

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

export const ABOUT_SUB_PAGE_SLUGS = [
  "who-we-are",
  "leadership",
  "history",
  "business",
  "credentials",
] as const;
export type AboutSubPageSlug = (typeof ABOUT_SUB_PAGE_SLUGS)[number];

export const ABOUT_SUB_PAGE_STATUSES = ["published", "comingSoon", "hidden"] as const;
export type AboutSubPageStatus = (typeof ABOUT_SUB_PAGE_STATUSES)[number];

/**
 * Section render mode used by Page Title + Page Body on every CMS-driven
 * public page (About sub-pages + Solution sub-pages). Stored per section on
 * AboutSubPage + SolutionPage docs.
 *
 * - disabled → public skips the section entirely
 * - default  → public renders i18n defaults (SectionTitles + eyebrow)
 * - custom   → public renders the localized fields the editor saved
 */
export const SECTION_MODES = ["disabled", "default", "custom"] as const;
export type SectionMode = (typeof SECTION_MODES)[number];

export const IR_SUB_PAGE_SLUGS = [
  "stocks",
  "reports",
  "publications",
  "press-release",
  "newsroom",
  "company-profile",
] as const;
export type IrSubPageSlug = (typeof IR_SUB_PAGE_SLUGS)[number];

export const IR_SUB_PAGE_STATUSES = ["published", "comingSoon", "hidden"] as const;
export type IrSubPageStatus = (typeof IR_SUB_PAGE_STATUSES)[number];

/** Employment type for a Career job opening. */
export const JOB_EMPLOYMENT_TYPES = ["fullTime", "partTime", "contract", "internship"] as const;
export type JobEmploymentType = (typeof JOB_EMPLOYMENT_TYPES)[number];

/**
 * Page-level visibility status shared by the Contact + Career singleton pages.
 * Same values as the solution/about/IR page statuses — hidden → 404,
 * comingSoon → Coming Soon page, published → live.
 */
export const PAGE_STATUSES = ["published", "comingSoon", "hidden"] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

/**
 * Whitelist of lucide-react icon names available to the Solution card editor
 * on /admin/landing. Reuses several stat icons plus the two trade-specific
 * ones (Handshake/HardHat) already used as defaults.
 */
export const SOLUTION_ICONS = [
  "Handshake",
  "Factory",
  "HardHat",
  "Wrench",
  "Building2",
  "Briefcase",
  "Globe",
  "TrendingUp",
  "Cpu",
] as const;
export type SolutionIcon = (typeof SOLUTION_ICONS)[number];
