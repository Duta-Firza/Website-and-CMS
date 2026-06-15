import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  align?: "right" | "between";
  className?: string;
}

/**
 * Sticks the admin form action row to the bottom of the viewport so the Save
 * button stays visible regardless of scroll position. `-mx-6 px-6` cancels the
 * parent's inset and re-applies it so the bar extends to the content edges; the
 * backdrop blur + top shadow visually separates it from the form above.
 */
export function StickyFormBar({ children, align = "right", className }: Props) {
  return (
    <div
      data-sticky-form-bar=""
      className={cn(
        "sticky bottom-0 z-20 -mx-6 mt-6 flex min-h-18 items-center border-t bg-background/95 px-6 py-4 shadow-[0_-2px_8px_-4px_rgba(0,0,0,0.1)] backdrop-blur supports-backdrop-filter:bg-background/80",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full items-center gap-2",
          align === "between" ? "justify-between" : "justify-end",
        )}
      >
        {children}
      </div>
    </div>
  );
}
