/**
 * Shared types + defaults for the Investor-Relations report download/view gate
 * form. Mirrors solutions' `form-fields.ts` but with its own system keys — the
 * four guaranteed lead fields that map to dedicated columns on the
 * `ReportDownload` model. Anything else lives in `ReportDownload.customFieldValues`.
 *
 * Re-uses the `FormField` / `FormSettings` shapes from `form-fields.ts` — only
 * the system keys + defaults differ.
 */

import type { FormField, FormFieldType, FormSettings } from "./form-fields";

export type { FormField, FormFieldType, FormSettings };

export const REPORT_DOWNLOAD_SYSTEM_KEYS = ["fullName", "email", "phone", "company"] as const;
export type ReportDownloadSystemKey = (typeof REPORT_DOWNLOAD_SYSTEM_KEYS)[number];

export const DEFAULT_REPORT_DOWNLOAD_FIELDS: FormField[] = [
  {
    key: "fullName",
    label: { id: "Nama Lengkap", en: "Full Name" },
    placeholder: { id: "", en: "" },
    type: "text",
    required: true,
    order: 1,
    options: [],
  },
  {
    key: "email",
    label: { id: "Email", en: "Email" },
    placeholder: { id: "", en: "" },
    type: "email",
    required: true,
    order: 2,
    options: [],
  },
  {
    key: "phone",
    label: { id: "Telepon", en: "Phone" },
    placeholder: { id: "", en: "" },
    type: "tel",
    required: true,
    order: 3,
    options: [],
  },
  {
    key: "company",
    label: { id: "Perusahaan", en: "Company" },
    placeholder: { id: "", en: "" },
    type: "text",
    required: true,
    order: 4,
    options: [],
  },
];

export const DEFAULT_REPORT_DOWNLOAD_FORM_SETTINGS: FormSettings = {
  enabled: true,
  submitLabel: { id: "Unduh Laporan", en: "Download Report" },
  successMessage: {
    id: "Terima kasih, unduhan Anda akan segera dimulai.",
    en: "Thank you, your download will begin shortly.",
  },
  fields: DEFAULT_REPORT_DOWNLOAD_FIELDS,
};

export function isReportDownloadSystemKey(key: string): key is ReportDownloadSystemKey {
  return (REPORT_DOWNLOAD_SYSTEM_KEYS as readonly string[]).includes(key);
}

/**
 * Split a flat key→value payload into system-column fields and a custom-fields
 * map. Used by `submitReportLead` on the server.
 */
export function splitReportDownloadPayload(values: Record<string, string>): {
  system: Partial<Record<ReportDownloadSystemKey, string>>;
  custom: Record<string, string>;
} {
  const system: Partial<Record<ReportDownloadSystemKey, string>> = {};
  const custom: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) {
    if (isReportDownloadSystemKey(k)) system[k] = v;
    else custom[k] = v;
  }
  return { system, custom };
}

/**
 * Ensure the four locked system fields always exist (prepended if missing), so a
 * partially-migrated doc can never drop a guaranteed lead field.
 */
export function ensureReportDownloadSystemFields(fields: FormField[]): FormField[] {
  const present = new Set(fields.map((f) => f.key));
  const missing = DEFAULT_REPORT_DOWNLOAD_FIELDS.filter((f) => !present.has(f.key));
  return missing.length ? [...missing, ...fields] : fields;
}
