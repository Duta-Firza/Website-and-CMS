/**
 * Helpers for building "Chat via WhatsApp" deep links.
 *
 * wa.me expects the destination phone number in international format with
 * digits only (no `+`, spaces, or punctuation). The message is passed as a
 * URL-encoded `text` query parameter.
 */

/** Strip every non-digit so the value is safe to drop into a wa.me URL. */
export function sanitizeWaNumber(raw: string): string {
  return (raw ?? "").replace(/\D/g, "");
}

/** Replace the `{product}` placeholder in a message template. */
export function fillTemplate(template: string, productName: string): string {
  return (template ?? "").replaceAll("{product}", productName);
}

/**
 * Build a wa.me deep link. Returns `null` when the number is missing/invalid so
 * callers can render a disabled state instead of a broken link.
 */
export function buildWaLink(number: string, message: string): string | null {
  const digits = sanitizeWaNumber(number);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
