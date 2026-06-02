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
 * plus nested sub-sub items when the active submenu has children.
 * Active state is derived from the URL pathname (longest-prefix match).
 */
export function SectionSidebar({ section }: Props) {
  const t = useTranslations("Nav");
  const pathname = usePathname() ?? "";

  // Strip trailing slash for cleaner equality checks
  const current = pathname.replace(/\/$/, "");

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
            const subActive = isActiveHref(current, sub.href);
            const hasChildren = (sub.children?.length ?? 0) > 0;
            return (
              <li key={sub.labelKey}>
                <Link
                  href={sub.href}
                  className={cn(
                    "block -ml-px border-l-2 px-4 py-2 text-sm transition-colors",
                    subActive
                      ? "border-brand-deep font-semibold text-brand-deep dark:border-foreground dark:text-foreground"
                      : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {t(sub.labelKey)}
                </Link>
                {hasChildren && subActive && (
                  <ul className="ml-4 space-y-0.5 border-l">
                    {sub.children?.map((subSub) => {
                      const subSubActive = isActiveHref(current, subSub.href);
                      return (
                        <li key={subSub.labelKey}>
                          <Link
                            href={subSub.href}
                            className={cn(
                              "block -ml-px border-l-2 px-4 py-1.5 text-sm transition-colors",
                              subSubActive
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

/**
 * Longest-prefix match — exact for leaf routes, prefix for parents.
 * Handles the "Who We Are" case where `/about` is both the section root
 * and the first submenu item.
 */
function isActiveHref(current: string, href: string): boolean {
  const target = href.replace(/\/$/, "");
  if (current === target) return true;
  return current.startsWith(`${target}/`);
}
