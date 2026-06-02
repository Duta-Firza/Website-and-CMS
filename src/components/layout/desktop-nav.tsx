"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { buildNav, type NavTop } from "./main-nav";

const triggerLinkClass =
  "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-muted hover:text-foreground";

const subItemClass =
  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm leading-snug transition-colors hover:bg-muted";

const subSubItemClass =
  "block rounded-md px-3 py-2 text-sm leading-snug transition-colors hover:bg-muted";

export function DesktopNav() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const items = buildNav(locale);

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="gap-0.5">
        {items.map((item) =>
          item.children && item.children.length > 0 ? (
            <TopWithMenu key={item.labelKey} item={item} t={t} />
          ) : (
            <NavigationMenuItem key={item.labelKey}>
              <NavigationMenuLink render={<Link href={item.href} className={triggerLinkClass} />}>
                {t(item.labelKey)}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function TopWithMenu({ item, t }: { item: NavTop; t: ReturnType<typeof useTranslations> }) {
  // A section is 2-column when at least one of its submenu items has sub-sub children
  // (e.g. Solutions → Trading → {Partners, Products}). Otherwise render a compact 1-column.
  const hasAnySubSub = item.children?.some((c) => c.children && c.children.length > 0) ?? false;
  const firstSubWithChildren = item.children?.find((c) => c.children && c.children.length > 0);
  const [hoveredKey, setHoveredKey] = useState<string | undefined>(firstSubWithChildren?.labelKey);
  const hoveredSub = item.children?.find((c) => c.labelKey === hoveredKey);

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger render={<Link href={item.href} className={triggerLinkClass} />}>
        {t(item.labelKey)}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div
          className={cn("p-3", hasAnySubSub ? "grid w-135 grid-cols-[220px_1fr] gap-4" : "w-65")}
        >
          {/* Left column — submenu list */}
          <ul className="space-y-0.5">
            {item.children?.map((sub) => {
              const hasChildren = (sub.children?.length ?? 0) > 0;
              return (
                <li key={sub.labelKey}>
                  <NavigationMenuLink
                    render={
                      <Link
                        href={sub.href}
                        onMouseEnter={() => {
                          if (hasChildren) setHoveredKey(sub.labelKey);
                        }}
                        className={cn(
                          subItemClass,
                          hasAnySubSub && hoveredKey === sub.labelKey && "bg-muted",
                        )}
                      />
                    }
                  >
                    <span>{t(sub.labelKey)}</span>
                    {hasChildren && (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </NavigationMenuLink>
                </li>
              );
            })}
          </ul>

          {/* Right column — sub-sub items of currently-hovered submenu */}
          {hasAnySubSub && (
            <div className="border-l pl-4">
              {hoveredSub?.children && hoveredSub.children.length > 0 ? (
                <>
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(hoveredSub.labelKey)}
                  </p>
                  <ul className="space-y-0.5">
                    {hoveredSub.children.map((subSub) => (
                      <li key={subSub.labelKey}>
                        <NavigationMenuLink
                          render={<Link href={subSub.href} className={subSubItemClass} />}
                        >
                          {t(subSub.labelKey)}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="px-3 pt-2 text-xs italic text-muted-foreground/70">
                  {t(item.labelKey)}
                </p>
              )}
            </div>
          )}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
