import type { LocalizedString } from "@/models";

export type Locale = "id" | "en";

/**
 * Pick a single string from a localized object. Falls back to the other locale
 * if the requested one is empty, then to an empty string as last resort.
 */
export function pickLocale(field: LocalizedString | undefined | null, locale: Locale): string {
  if (!field) return "";
  const primary = field[locale];
  if (primary?.trim()) return primary;
  const fallback = locale === "id" ? field.en : field.id;
  return fallback?.trim() ? fallback : "";
}

/**
 * Deeply walk an object and localize any `{ id, en }` shaped sub-objects.
 * Used after `.lean()` on Mongoose docs to flatten localized fields to
 * plain strings for a given locale.
 */
export function localize<T>(value: T, locale: Locale): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => localize(item, locale)) as unknown as T;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.id === "string" && typeof obj.en === "string" && Object.keys(obj).length === 2) {
      return pickLocale(obj as unknown as LocalizedString, locale) as unknown as T;
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = localize(v, locale);
    }
    return out as T;
  }
  return value;
}
