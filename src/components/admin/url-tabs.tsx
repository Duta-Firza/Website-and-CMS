"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Tabs } from "@/components/ui/tabs";

interface UrlTabsProps {
  /** Tab value used when the URL has no (or an unknown) `tab` param. */
  defaultTab: string;
  /** Whitelist of acceptable tab values — anything else falls back to default. */
  validValues: readonly string[];
  /** URL search-param key to read + write. Defaults to `tab`. */
  paramKey?: string;
  className?: string;
  children: ReactNode;
}

/**
 * `useState`-style hook that returns the current tab plus a setter, both
 * synced to a URL search param. Use this directly when the parent component
 * needs to react to the active tab (filtering, dialog state, etc.). For the
 * simple "wrap Tabs + URL" case prefer the <UrlTabs> wrapper below.
 */
export function useUrlTabState<T extends string>(
  defaultTab: T,
  validValues: readonly T[],
  paramKey = "tab",
): readonly [T, (next: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlValue = searchParams.get(paramKey);
  const initial =
    urlValue && (validValues as readonly string[]).includes(urlValue)
      ? (urlValue as T)
      : defaultTab;
  const [tab, setTab] = useState<T>(initial);

  const setTabAndUrl = (next: T) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return [tab, setTabAndUrl] as const;
}

/**
 * Controlled Tabs that round-trip the active value through a URL search
 * param so a hard refresh keeps the same tab visible. The tab change updates
 * the URL via `router.replace` (shallow, scroll-preserving) so the page
 * itself doesn't re-fetch.
 */
export function UrlTabs({
  defaultTab,
  validValues,
  paramKey = "tab",
  className,
  children,
}: UrlTabsProps) {
  const [tab, setTab] = useUrlTabState(defaultTab, validValues, paramKey);
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v)} className={className}>
      {children}
    </Tabs>
  );
}
