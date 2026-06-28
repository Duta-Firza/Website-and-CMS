/**
 * Shared, framework-agnostic helpers for the admin list query (search / sort /
 * filter / status / pagination). Kept free of "use client" / server-only code so
 * it can be imported from both the URL-driven client hook and the server-side
 * page loaders that actually run the query.
 */

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export interface AdminListParams {
  q: string;
  sort: string;
  /** Primary categorical filter (origin for products, category for projects). */
  filter: string;
  /** Secondary status filter (active/inactive, published/unpublished). */
  status: string;
  page: number;
  pageSize: number;
}

export function normalizePageSize(raw: number): number {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(raw) ? raw : PAGE_SIZE_OPTIONS[0];
}

/** Parse the list params out of a Next.js `searchParams` object (server-side). */
export function parseAdminListParams(
  sp: Record<string, string | string[] | undefined>,
  defaultSort: string,
): AdminListParams {
  const get = (k: string): string | undefined => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  return {
    q: (get("q") ?? "").trim(),
    sort: get("sort") ?? defaultSort,
    filter: get("filter") ?? "all",
    status: get("status") ?? "all",
    page: Math.max(1, Number.parseInt(get("page") ?? "1", 10) || 1),
    pageSize: normalizePageSize(Number.parseInt(get("size") ?? "", 10)),
  };
}

/**
 * Result shape returned by the server-side list loaders: the requested page plus
 * the metadata the client needs — total count and the full ordered id list used
 * to reconstruct a drag-reorder from a single page.
 */
export interface PaginateResult<T> {
  items: T[];
  total: number;
  /** Every id in canonical (manual) order — lets the client reconstruct a full
   * reorder from a single page when no search/filter/sort is active. */
  allIds: string[];
}
