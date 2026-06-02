"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
import { findActiveHref, isExactActive, isTopActive } from "./nav-active";

const triggerBase =
  "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm transition-colors hover:bg-muted hover:text-foreground";
const triggerInactive = "font-medium text-foreground/85";
// `[&_svg]:stroke-[2.5]` thickens the ChevronDown caret inside the trigger so
// the icon reads as "active" alongside the label.
const triggerActive = "font-semibold text-brand-deep dark:text-foreground [&_svg]:stroke-[2.5]";

const subItemBase =
  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm leading-snug transition-colors hover:bg-muted";
const subSubItemBase =
  "block rounded-md px-3 py-2 text-sm leading-snug transition-colors hover:bg-muted";
const itemActive = "font-semibold text-brand-deep dark:text-foreground";

export function DesktopNav() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname() ?? "";
  const items = buildNav(locale);
  const activeHref = findActiveHref(items, pathname);

  // Controlled open state so we can dismiss the menu the moment a link is
  // followed — base-ui leaves the trigger in `data-popup-open` (= muted bg)
  // until something else closes it, which feels sticky after navigation.
  const [openValue, setOpenValue] = useState<string | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on path change is the whole point — close the menu after navigation
  useEffect(() => {
    setOpenValue(null);
  }, [pathname]);
  const closeMenu = () => setOpenValue(null);

  return (
    <NavigationMenu value={openValue} onValueChange={setOpenValue} className="hidden md:flex">
      <NavigationMenuList className="gap-0.5">
        {items.map((item) => {
          const active = isTopActive(activeHref, item.href);
          const className = cn(triggerBase, active ? triggerActive : triggerInactive);
          if (!item.children || item.children.length === 0) {
            return (
              <NavigationMenuItem key={item.labelKey}>
                <NavigationMenuLink
                  render={
                    <Link
                      href={item.href}
                      className={className}
                      aria-current={active ? "page" : undefined}
                      onClick={closeMenu}
                    />
                  }
                >
                  {t(item.labelKey)}
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }
          return (
            <TopWithMenu
              key={item.labelKey}
              item={item}
              t={t}
              activeHref={activeHref}
              triggerClassName={className}
              active={active}
              closeMenu={closeMenu}
            />
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

interface TopWithMenuProps {
  item: NavTop;
  t: ReturnType<typeof useTranslations>;
  activeHref: string | undefined;
  triggerClassName: string;
  active: boolean;
  closeMenu: () => void;
}

function TopWithMenu({
  item,
  t,
  activeHref,
  triggerClassName,
  active,
  closeMenu,
}: TopWithMenuProps) {
  // A section is 2-column when at least one of its submenu items has sub-sub children
  // (e.g. Solutions → Trading → {Partners, Products}). Otherwise render a compact 1-column.
  const hasAnySubSub = item.children?.some((c) => c.children && c.children.length > 0) ?? false;
  const firstSubWithChildren = item.children?.find((c) => c.children && c.children.length > 0);
  const [hoveredKey, setHoveredKey] = useState<string | undefined>(firstSubWithChildren?.labelKey);
  const hoveredSub = item.children?.find((c) => c.labelKey === hoveredKey);

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        nativeButton={false}
        render={
          <Link
            href={item.href}
            className={triggerClassName}
            aria-current={active ? "page" : undefined}
            onClick={closeMenu}
          />
        }
      >
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
              const subActive = isExactActive(activeHref, sub.href);
              return (
                <li key={sub.labelKey}>
                  <NavigationMenuLink
                    render={
                      <Link
                        href={sub.href}
                        onMouseEnter={() => {
                          if (hasChildren) setHoveredKey(sub.labelKey);
                        }}
                        onClick={closeMenu}
                        aria-current={subActive ? "page" : undefined}
                        className={cn(
                          subItemBase,
                          subActive && itemActive,
                          hasAnySubSub && hoveredKey === sub.labelKey && !subActive && "bg-muted",
                        )}
                      />
                    }
                  >
                    <span>{t(sub.labelKey)}</span>
                    {hasChildren && (
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          subActive ? "stroke-[2.5]" : "text-muted-foreground",
                        )}
                      />
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
                    {hoveredSub.children.map((subSub) => {
                      const ssActive = isExactActive(activeHref, subSub.href);
                      return (
                        <li key={subSub.labelKey}>
                          <NavigationMenuLink
                            render={
                              <Link
                                href={subSub.href}
                                onClick={closeMenu}
                                aria-current={ssActive ? "page" : undefined}
                                className={cn(subSubItemBase, ssActive && itemActive)}
                              />
                            }
                          >
                            {t(subSub.labelKey)}
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
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
