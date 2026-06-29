import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  /** The active search term; case-insensitive. Empty disables highlighting. */
  query: string;
  className?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Renders `text` with every occurrence of `query` wrapped in a highlighted
 * <mark>. Safe to use in Server Components — it only splits a string.
 */
export function HighlightText({ text, query, className }: Props) {
  const q = query.trim();
  if (!q || !text) return <>{text}</>;

  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "gi"));
  const lower = q.toLowerCase();

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lower ? (
          <mark
            // biome-ignore lint/suspicious/noArrayIndexKey: split order is stable for a given text+query
            key={i}
            className={cn(
              "rounded-[2px] bg-brand-accent/20 px-0.5 font-medium text-brand-deep dark:text-foreground",
              className,
            )}
          >
            {part}
          </mark>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: split order is stable for a given text+query
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
