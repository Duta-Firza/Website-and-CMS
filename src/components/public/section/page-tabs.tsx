"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export interface PageTab {
  key: string;
  label: string;
}

interface Props {
  tabs: PageTab[];
  /** Tab key when ?tab is absent or invalid. Defaults to first tab. */
  defaultKey?: string;
}

/**
 * URL-driven tab bar. The active tab is the `?tab` search param; switching
 * updates the URL via shallow router.replace so navigation history stays clean
 * and the tab is deep-linkable. Renders nothing if `tabs.length < 2`.
 */
export function PageTabs({ tabs, defaultKey }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (tabs.length < 2) return null;

  const fallback = defaultKey ?? tabs[0].key;
  const raw = params.get("tab");
  const active = tabs.some((t) => t.key === raw) ? (raw as string) : fallback;

  const switchTo = (key: string) => {
    const next = new URLSearchParams(params.toString());
    if (key === fallback) next.delete("tab");
    else next.set("tab", key);
    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  return (
    <div role="tablist" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={isPending}
            onClick={() => switchTo(tab.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-deep text-white dark:bg-foreground dark:text-background"
                : "border border-border bg-background text-foreground/70 hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// Server-safe `resolveActiveTab` lives in ./resolve-active-tab so Server
// Components can use it without crossing the client boundary.
