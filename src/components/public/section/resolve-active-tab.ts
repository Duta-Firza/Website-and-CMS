/**
 * Server-safe helper to resolve which tab is active for a given
 * `?tab=` search param. Lives in its own (non-"use client") module so
 * Server Components can import it without crossing the client boundary.
 */
export function resolveActiveTab<T extends string>(
  tabs: readonly { key: T }[],
  searchParam: string | string[] | undefined,
  defaultKey?: T,
): T {
  const raw = Array.isArray(searchParam) ? searchParam[0] : searchParam;
  const match = tabs.find((t) => t.key === raw);
  if (match) return match.key;
  return defaultKey ?? tabs[0].key;
}
