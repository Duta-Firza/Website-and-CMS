"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ToolbarOption {
  value: string;
  label: string;
}

interface Props {
  searchPlaceholder: string;
  searchAriaLabel: string;
  /** Sort options; the first entry is treated as the default (URL param omitted). */
  sortLabel: string;
  sortOptions: ToolbarOption[];
  /** Optional categorical filter; the first entry is treated as "all" (param omitted). */
  filterLabel?: string;
  filterOptions?: ToolbarOption[];
  searchKey?: string;
  sortKey?: string;
  filterKey?: string;
}

/**
 * URL-driven search / sort / filter controls for public list pages. The server
 * page reads the resulting `q` / `sort` / `filter` (+ `page`) params and renders
 * the filtered, paginated result; this component only mutates the URL.
 */
export function ListToolbar({
  searchPlaceholder,
  searchAriaLabel,
  sortLabel,
  sortOptions,
  filterLabel,
  filterOptions,
  searchKey = "q",
  sortKey = "sort",
  filterKey = "filter",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get(searchKey) ?? "";
  const defaultSort = sortOptions[0]?.value ?? "default";
  const currentSort = searchParams.get(sortKey) ?? defaultSort;
  const allFilter = filterOptions?.[0]?.value ?? "all";
  const currentFilter = searchParams.get(filterKey) ?? allFilter;

  const [term, setTerm] = useState(currentQ);
  const focusedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reflect external URL changes (back/forward navigation) into the input, but
  // never while the user is actively typing into it.
  useEffect(() => {
    if (!focusedRef.current) setTerm(currentQ);
  }, [currentQ]);

  const pushParam = (key: string, value: string, isDefault: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (isDefault || !value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onSearchChange = (value: string) => {
    setTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParam(searchKey, value.trim(), false);
    }, 350);
  };

  const flushSearch = () => {
    focusedRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (term.trim() !== currentQ) pushParam(searchKey, term.trim(), false);
  };

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          value={term}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => {
            focusedRef.current = true;
          }}
          onBlur={flushSearch}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          className="h-9 pl-8"
        />
      </div>
      <div className="flex items-center gap-2">
        {filterOptions && filterOptions.length > 1 && (
          <Select
            items={filterOptions}
            value={currentFilter}
            onValueChange={(v) => {
              const next = (v as string | null) ?? allFilter;
              pushParam(filterKey, next, next === allFilter);
            }}
          >
            <SelectTrigger className="h-9 w-40" aria-label={filterLabel}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select
          items={sortOptions}
          value={currentSort}
          onValueChange={(v) => {
            const next = (v as string | null) ?? defaultSort;
            pushParam(sortKey, next, next === defaultSort);
          }}
        >
          <SelectTrigger className="h-9 w-40" aria-label={sortLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
