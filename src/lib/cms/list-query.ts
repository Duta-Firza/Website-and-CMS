/**
 * Shared helpers for URL-driven, server-side list pages (search + pagination).
 * The page component reads `q` / `page` / `pageSize` from searchParams; these
 * normalize the raw strings into safe values for a MongoDB query.
 */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

/** Escape user input before using it inside a `RegExp` (search). */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Clamp a raw `pageSize` param to one of the allowed options. */
export function parsePageSize(raw: string | undefined): number {
  const n = Number(raw);
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(n) ? n : DEFAULT_PAGE_SIZE;
}

/** Parse a 1-based `page` param, defaulting to 1 for missing/invalid input. */
export function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
