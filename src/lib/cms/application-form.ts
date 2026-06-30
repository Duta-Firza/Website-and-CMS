/**
 * Shared types + defaults for the in-app job application form. Mirrors the
 * report-download gate (`report-download-form.ts`) but with its own system keys
 * — the applicant fields that map to dedicated columns on the `Application`
 * model. Anything else lives in `Application.customFieldValues`. The CV file is
 * handled separately (uploaded via `/api/careers/apply/upload`, not a form field).
 */

import type { FormField, FormFieldType, FormSettings } from "./form-fields";

export type { FormField, FormFieldType, FormSettings };

export const APPLICATION_SYSTEM_KEYS = ["firstName", "lastName", "email", "phone"] as const;
export type ApplicationSystemKey = (typeof APPLICATION_SYSTEM_KEYS)[number];

export const DEFAULT_APPLICATION_FIELDS: FormField[] = [
  {
    key: "firstName",
    label: { id: "Nama Depan", en: "First Name" },
    placeholder: { id: "", en: "" },
    type: "text",
    required: true,
    order: 1,
    options: [],
  },
  {
    key: "lastName",
    label: { id: "Nama Belakang", en: "Last Name" },
    placeholder: { id: "", en: "" },
    type: "text",
    required: false,
    order: 2,
    options: [],
  },
  {
    key: "email",
    label: { id: "Email", en: "Email" },
    placeholder: { id: "", en: "" },
    type: "email",
    required: true,
    order: 3,
    options: [],
  },
  {
    key: "phone",
    label: { id: "Telepon", en: "Phone" },
    placeholder: { id: "", en: "" },
    type: "tel",
    required: true,
    order: 4,
    options: [],
  },
];

export const DEFAULT_APPLICATION_FORM_SETTINGS: FormSettings = {
  enabled: true,
  submitLabel: { id: "Kirim Lamaran", en: "Submit Application" },
  successMessage: {
    id: "Terima kasih, lamaran Anda sudah kami terima.",
    en: "Thank you, your application has been received.",
  },
  fields: DEFAULT_APPLICATION_FIELDS,
};

export function isApplicationSystemKey(key: string): key is ApplicationSystemKey {
  return (APPLICATION_SYSTEM_KEYS as readonly string[]).includes(key);
}

/**
 * Split a flat key→value payload into system-column fields and a custom-fields
 * map. Used by `submitApplication` on the server.
 */
export function splitApplicationPayload(values: Record<string, string>): {
  system: Partial<Record<ApplicationSystemKey, string>>;
  custom: Record<string, string>;
} {
  const system: Partial<Record<ApplicationSystemKey, string>> = {};
  const custom: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) {
    if (isApplicationSystemKey(k)) system[k] = v;
    else custom[k] = v;
  }
  return { system, custom };
}

/**
 * Ensure the locked system fields always exist (prepended if missing), so a
 * partially-migrated doc can never drop a guaranteed applicant field.
 */
export function ensureApplicationSystemFields(fields: FormField[]): FormField[] {
  const present = new Set(fields.map((f) => f.key));
  const missing = DEFAULT_APPLICATION_FIELDS.filter((f) => !present.has(f.key));
  return missing.length ? [...missing, ...fields] : fields;
}
