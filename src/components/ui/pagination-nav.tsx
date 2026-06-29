import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  extraParams?: Record<string, string>;
}

function buildHref(
  baseUrl: string,
  page: number,
  extra?: Record<string, string>,
): string {
  const params = new URLSearchParams({ ...(extra ?? {}), page: String(page) });
  return `${baseUrl}?${params.toString()}`;
}

export function PaginationNav({ currentPage, totalPages, baseUrl, extraParams }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={buildHref(baseUrl, currentPage - 1, extraParams)}
          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-sm" }),
            "pointer-events-none opacity-40",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(baseUrl, p, extraParams)}
            className={cn(
              buttonVariants({ variant: p === currentPage ? "default" : "ghost", size: "sm" }),
              "min-w-[32px]",
            )}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(baseUrl, currentPage + 1, extraParams)}
          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-sm" }),
            "pointer-events-none opacity-40",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
