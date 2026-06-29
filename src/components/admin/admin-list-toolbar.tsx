"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { AdminListParamsApi } from "@/components/admin/use-admin-list-params";
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
  params: AdminListParamsApi;
  searchPlaceholder: string;
  /** Sort options; the first entry is the default (param omitted when chosen). */
  sortOptions: ToolbarOption[];
  sortLabel: string;
  /** Primary filter (origin / category); first entry is "all". Omit to hide. */
  filterOptions?: ToolbarOption[];
  filterLabel?: string;
  /** Status filter; first entry is "all". Omit to hide. */
  statusOptions?: ToolbarOption[];
  statusLabel?: string;
}

function buildItems(options: ToolbarOption[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}

/** URL-driven search / sort / filter / status controls for admin list tables. */
export function AdminListToolbar({
  params,
  searchPlaceholder,
  sortOptions,
  sortLabel,
  filterOptions,
  filterLabel,
  statusOptions,
  statusLabel,
}: Props) {
  const t = useTranslations("Admin");
  const defaultSort = sortOptions[0]?.value ?? "manual";

  const [term, setTerm] = useState(params.q);
  const focusedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reflect external URL changes into the input unless the user is typing.
  useEffect(() => {
    if (!focusedRef.current) setTerm(params.q);
  }, [params.q]);

  const pushSearch = (value: string) => {
    const trimmed = value.trim();
    params.update({ q: trimmed || null });
  };

  const onSearchChange = (value: string) => {
    setTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushSearch(value), 350);
  };

  const flushSearch = () => {
    focusedRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (term.trim() !== params.q) pushSearch(term);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-48 flex-1">
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
          aria-label={t("common.search")}
          className="h-9 pl-8"
        />
      </div>

      {filterOptions && filterOptions.length > 1 && (
        <Select
          items={buildItems(filterOptions)}
          value={params.filter}
          onValueChange={(v) => {
            const next = (v as string | null) ?? "all";
            params.update({ filter: next === "all" ? null : next });
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

      {statusOptions && statusOptions.length > 1 && (
        <Select
          items={buildItems(statusOptions)}
          value={params.status}
          onValueChange={(v) => {
            const next = (v as string | null) ?? "all";
            params.update({ status: next === "all" ? null : next });
          }}
        >
          <SelectTrigger className="h-9 w-36" aria-label={statusLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        items={buildItems(sortOptions)}
        value={params.sort}
        onValueChange={(v) => {
          const next = (v as string | null) ?? defaultSort;
          params.update({ sort: next === defaultSort ? null : next });
        }}
      >
        <SelectTrigger className="h-9 w-44" aria-label={sortLabel}>
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
  );
}
