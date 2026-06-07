type Locale = "id" | "en";
type LocalizedField = { id: string; en: string };

/**
 * Pick the matching locale string from a `{ id, en }` field with fallback to
 * the other locale. Used in admin tables so that toggling the language switcher
 * actually swaps which value is rendered.
 */
export function pickLocalized(field: LocalizedField | undefined, locale: string): string {
  if (!field) return "";
  const l = (locale === "en" ? "en" : "id") as Locale;
  const primary = field[l];
  if (primary?.trim()) return primary;
  const fallback = l === "en" ? field.id : field.en;
  return fallback ?? "";
}
