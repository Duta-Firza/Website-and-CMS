"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/lib/cms/list-params";

export { PAGE_SIZE_OPTIONS };

interface Props {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  rangeFrom: number;
  rangeTo: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}

/** Shared prev / page-picker / next pagination footer for admin tables. */
export function TablePagination({
  page,
  pageCount,
  pageSize,
  total,
  rangeFrom,
  rangeTo,
  onPage,
  onPageSize,
}: Props) {
  const t = useTranslations("Admin");
  const pageSizeItems = Object.fromEntries(
    PAGE_SIZE_OPTIONS.map((n) => [String(n), t("common.perPage", { count: n })]),
  );
  const pageItems = Object.fromEntries(
    Array.from({ length: pageCount }, (_, i) => [String(i + 1), t("common.page", { n: i + 1 })]),
  );
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
      <span>{t("common.showing", { from: rangeFrom, to: rangeTo, total })}</span>
      <div className="flex items-center gap-2">
        <Select
          items={pageSizeItems}
          value={String(pageSize)}
          onValueChange={(v) => onPageSize(Number(v))}
        >
          <SelectTrigger className="h-8 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {t("common.perPage", { count: n })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            aria-label={t("common.prevPage")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select items={pageItems} value={String(page)} onValueChange={(v) => onPage(Number(v))}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <SelectItem key={p} value={String(p)}>
                  {t("common.page", { n: p })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= pageCount}
            onClick={() => onPage(page + 1)}
            aria-label={t("common.nextPage")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
