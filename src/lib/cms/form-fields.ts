/**
 * Shared types + defaults for the dynamic Solutions inquiry form.
 *
 * `SYSTEM_FIELD_KEYS` are the field keys that have dedicated columns on the
 * Inquiry model. Anything else lives in `Inquiry.customFieldValues` as a
 * free-form map of strings.
 */

export const FORM_FIELD_TYPES = ["text", "email", "tel", "textarea", "number", "select"] as const;
export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

export const SYSTEM_FIELD_KEYS = [
  "firstName",
  "lastName",
  "email",
  "company",
  "phone",
  "websiteUrl",
  "country",
  "message",
] as const;
export type SystemFieldKey = (typeof SYSTEM_FIELD_KEYS)[number];

export interface FormFieldOption {
  value: string;
  label: { id: string; en: string };
}

export interface FormField {
  key: string;
  label: { id: string; en: string };
  placeholder: { id: string; en: string };
  type: FormFieldType;
  required: boolean;
  order: number;
  options: FormFieldOption[];
}

export interface FormSettings {
  enabled: boolean;
  submitLabel: { id: string; en: string };
  successMessage: { id: string; en: string };
  fields: FormField[];
}

export const DEFAULT_FORM_FIELDS: FormField[] = [
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
    key: "company",
    label: { id: "Perusahaan", en: "Company" },
    placeholder: { id: "", en: "" },
    type: "text",
    required: true,
    order: 4,
    options: [],
  },
  {
    key: "phone",
    label: { id: "Telepon", en: "Phone" },
    placeholder: { id: "", en: "" },
    type: "tel",
    required: false,
    order: 5,
    options: [],
  },
  {
    key: "websiteUrl",
    label: { id: "Website", en: "Website" },
    placeholder: { id: "", en: "" },
    type: "text",
    required: false,
    order: 6,
    options: [],
  },
  {
    key: "country",
    label: { id: "Negara", en: "Country" },
    placeholder: { id: "", en: "" },
    type: "text",
    required: false,
    order: 7,
    options: [],
  },
  {
    key: "message",
    label: { id: "Pesan", en: "Message" },
    placeholder: { id: "", en: "" },
    type: "textarea",
    required: true,
    order: 8,
    options: [],
  },
];

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  enabled: true,
  submitLabel: { id: "Kirim Permintaan", en: "Send Request" },
  successMessage: {
    id: "Terima kasih, kami akan menghubungi Anda segera.",
    en: "Thank you, we'll be in touch shortly.",
  },
  fields: DEFAULT_FORM_FIELDS,
};

export function isSystemKey(key: string): key is SystemFieldKey {
  return (SYSTEM_FIELD_KEYS as readonly string[]).includes(key);
}

/**
 * Split a flat key→value payload into system-column fields and a custom-fields
 * map. Used by submitInquiry on the server.
 */
export function splitInquiryPayload(values: Record<string, string>): {
  system: Partial<Record<SystemFieldKey, string>>;
  custom: Record<string, string>;
} {
  const system: Partial<Record<SystemFieldKey, string>> = {};
  const custom: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) {
    if (isSystemKey(k)) system[k] = v;
    else custom[k] = v;
  }
  return { system, custom };
}
