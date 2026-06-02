"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { NavTop } from "@/components/layout/main-nav";
import { cn } from "@/lib/utils";

interface Props {
  section: NavTop;
}

/**
 * Left rail navigation for a public section. Shows the section's submenu items
 * plus nested sub-sub items when the active submenu (or any of its children) is
 * the current page. Active state is decided once with longest-prefix matching
 * across all hrefs in the section tree — this prevents a submenu whose href
 * equals the section root (e.g. "Who We Are" → /about) from staying active on
 * deeper routes like /about/leadership.
 */
export function SectionSidebar({ section }: Props) {
  const t = useTranslations("Nav");
  const current = normalize(usePathname() ?? "");

  // Collect every candidate href in the tree, then pick the longest one that
  // matches the current path. That's the single "active" href; every other
  // node compares against it by exact equality.
  const candidates: string[] = [];
  for (const sub of section.children ?? []) {
    candidates.push(sub.href);
    for (const ss of sub.children ?? []) candidates.push(ss.href);
  }
  const activeHref = candidates
    .filter((h) => matchesPath(current, h))
    .sort((a, b) => normalize(b).length - normalize(a).length)[0];

  return (
    <aside className="hidden shrink-0 md:block">
      <nav aria-label={t(section.labelKey)}>
        <Link
          href={section.href}
          className="block pb-4 text-xs font-semibold uppercase tracking-wider text-brand-accent"
        >
          {t(section.labelKey)}
        </Link>
        <ul className="space-y-0.5 border-l">
          {section.children?.map((sub) => {
            const subActive = activeHref === sub.href;
            const subSubActive = sub.children?.some((ss) => ss.href === activeHref) ?? false;
            const expand = (sub.children?.length ?? 0) > 0 && (subActive || subSubActive);
            return (
              <li key={sub.labelKey}>
                <Link
                  href={sub.href}
                  className={cn(
                    "block -ml-px border-l-2 px-3 py-1.5 text-sm transition-colors",
                    subActive
                      ? "border-brand-deep font-semibold text-brand-deep dark:border-foreground dark:text-foreground"
                      : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {t(sub.labelKey)}
                </Link>
                {expand && (
                  <ul className="ml-3 space-y-0.5 border-l">
                    {sub.children?.map((subSub) => {
                      const isActive = subSub.href === activeHref;
                      return (
                        <li key={subSub.labelKey}>
                          <Link
                            href={subSub.href}
                            className={cn(
                              "block -ml-px border-l-2 px-3 py-1 text-[13px] transition-colors",
                              isActive
                                ? "border-brand-deep font-medium text-brand-deep dark:border-foreground dark:text-foreground"
                                : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                            )}
                          >
                            {t(subSub.labelKey)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

function normalize(path: string): string {
  return path.replace(/\/$/, "");
}

function matchesPath(current: string, href: string): boolean {
  const target = normalize(href);
  return current === target || current.startsWith(`${target}/`);
}
