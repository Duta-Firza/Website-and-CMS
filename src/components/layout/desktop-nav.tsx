"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { buildNav, type NavItem } from "./main-nav";

const linkClass =
  "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted focus:bg-muted text-sm";

export function DesktopNav() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const items = buildNav(locale);

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="gap-1">
        {items.map((item) =>
          item.children ? (
            <DesktopSubmenu key={item.labelKey} item={item} t={t} />
          ) : (
            <NavigationMenuItem key={item.labelKey}>
              <NavigationMenuLink
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium text-foreground/85 hover:text-foreground transition-colors rounded-md hover:bg-muted",
                    )}
                  />
                }
              >
                {t(item.labelKey)}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function DesktopSubmenu({ item, t }: { item: NavItem; t: ReturnType<typeof useTranslations> }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{t(item.labelKey)}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[240px] gap-1 p-2">
          {item.children?.map((child) => (
            <li key={child.labelKey}>
              <NavigationMenuLink render={<Link href={child.href} className={linkClass} />}>
                {t(child.labelKey)}
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
