"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type AdminListParams, normalizePageSize } from "@/lib/cms/list-params";

/** URL search-param keys this hook reads and writes. */
export type AdminListParamKey = "q" | "sort" | "filter" | "status" | "page" | "size";

export interface AdminListParamsApi extends AdminListParams {
  /**
   * Patch one or more list params in the URL. Pass `null`/`""`/`0` to drop a
   * param. Any change other than `page` itself resets pagination to page 1.
   */
  update: (patch: Partial<Record<AdminListParamKey, string | number | null>>) => void;
}

/**
 * Reads the current list query (search/sort/filter/status/pagination) from the
 * URL and writes changes back via a shallow `router.replace`, so all of it is
 * resolved server-side on the next render rather than in the browser.
 */
export function useAdminListParams(defaultSort: string): AdminListParamsApi {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update: AdminListParamsApi["update"] = (patch) => {
    const params = new URLSearchParams(searchParams.toString());
    const touchesOnlyPage = Object.keys(patch).length === 1 && "page" in patch;
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "" || value === 0) params.delete(key);
      else params.set(key, String(value));
    }
    if (!touchesOnlyPage) params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    q: searchParams.get("q") ?? "",
    sort: searchParams.get("sort") ?? defaultSort,
    filter: searchParams.get("filter") ?? "all",
    status: searchParams.get("status") ?? "all",
    page: Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1),
    pageSize: normalizePageSize(Number.parseInt(searchParams.get("size") ?? "", 10)),
    update,
  };
}
