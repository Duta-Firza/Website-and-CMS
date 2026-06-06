"use client";

import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { type AdminNavGroup, type AdminNavItem, buildAdminNav } from "./admin-nav-data";
import { SIDEBAR_COLLAPSED_COOKIE, SIDEBAR_OPEN_GROUPS_COOKIE } from "./admin-sidebar-cookies";

interface Props {
  initialCollapsed: boolean;
  initialOpenGroup: string | null;
  user: { name: string; email: string; role?: string } | null;
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not yet broadly supported (Safari)
  document.cookie = `${name}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function splitHref(href: string): { path: string; params: URLSearchParams | null } {
  const [path, query] = href.split("?");
  return { path, params: query ? new URLSearchParams(query) : null };
}

export function AdminSidebarShell({ initialCollapsed, initialOpenGroup, user }: Props) {
  const locale = useLocale();
  const t = useTranslations("AdminNav");
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const nav = useMemo(() => buildAdminNav(locale), [locale]);

  const isActive = useMemo(() => {
    return (href: string): boolean => {
      const { path, params } = splitHref(href);
      if (params) {
        if (pathname !== path) return false;
        for (const [k, v] of params.entries()) {
          if (searchParams.get(k) !== v) return false;
        }
        return true;
      }
      return pathname === path;
    };
  }, [pathname, searchParams]);

  const activeGroupKey = useMemo(() => {
    for (const g of nav.groups) {
      if (g.items.some((it) => isActive(it.href))) return g.key;
    }
    return null;
  }, [nav, isActive]);

  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [openGroup, setOpenGroup] = useState<string | null>(initialOpenGroup ?? activeGroupKey);

  useEffect(() => {
    if (!activeGroupKey) return;
    setOpenGroup((prev) => {
      if (prev === activeGroupKey) return prev;
      setCookie(SIDEBAR_OPEN_GROUPS_COOKIE, activeGroupKey);
      return activeGroupKey;
    });
  }, [activeGroupKey]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      setCookie(SIDEBAR_COLLAPSED_COOKIE, next ? "1" : "0");
      return next;
    });
  };

  const toggleGroup = (key: string) => {
    setOpenGroup((prev) => {
      const next = prev === key ? null : key;
      setCookie(SIDEBAR_OPEN_GROUPS_COOKIE, next ?? "");
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-t-2 border-t-brand-accent/40 bg-card md:flex md:flex-col",
        "transition-[width] duration-200",
        collapsed ? "w-14" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {!collapsed && (
          <Link
            href={`/${locale}/admin`}
            className="inline-flex items-center"
            aria-label="Dashboard"
          >
            <Logo className="h-7 dark:brightness-0 dark:invert" />
          </Link>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t("expand") : t("collapse")}
          title={collapsed ? t("expand") : t("collapse")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className={cn("flex-1 overflow-y-auto py-3", collapsed ? "px-2" : "px-3")}>
        <ItemLink
          item={nav.top}
          collapsed={collapsed}
          active={isActive(nav.top.href)}
          label={t(nav.top.labelKey)}
        />

        {collapsed ? (
          <CompactItemList nav={nav} t={t} isActive={isActive} />
        ) : (
          <div className="mt-2 space-y-1">
            {nav.groups.map((group) => (
              <GroupSection
                key={group.key}
                group={group}
                open={openGroup === group.key}
                onToggle={() => toggleGroup(group.key)}
                t={t}
                isActive={isActive}
              />
            ))}
          </div>
        )}
      </nav>

      <div
        className={cn(
          "border-t",
          collapsed ? "flex flex-col items-center gap-1 px-1 py-2" : "space-y-2 px-3 py-3",
        )}
      >
        <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        {user && (
          <div className={cn(collapsed ? "flex justify-center" : "flex items-center")}>
            <AdminUserMenu
              name={user.name}
              email={user.email}
              role={user.role}
              compact={collapsed}
            />
          </div>
        )}
      </div>
    </aside>
  );
}

function ItemLink({
  item,
  collapsed,
  active,
  label,
}: {
  item: AdminNavItem;
  collapsed: boolean;
  active: boolean;
  label: string;
}) {
  const Icon = item.icon;
  const tNav = useTranslations("AdminNav");
  if (item.comingSoon) {
    return (
      <span
        title={collapsed ? `${label} · ${tNav("comingSoon")}` : undefined}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
          "cursor-not-allowed text-muted-foreground/60",
          collapsed && "justify-center",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{label}</span>
            <span className="rounded bg-muted px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {tNav("comingSoon")}
            </span>
          </>
        )}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
        collapsed && "justify-center",
        active
          ? "border-l-2 border-brand-accent bg-brand-accent/8 pl-[6px] text-brand-accent"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        collapsed && active && "border-l-0 pl-2",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
    </Link>
  );
}

function GroupSection({
  group,
  open,
  onToggle,
  t,
  isActive,
}: {
  group: AdminNavGroup;
  open: boolean;
  onToggle: () => void;
  t: (key: string) => string;
  isActive: (href: string) => boolean;
}) {
  const GroupIcon = group.icon;
  const hasActiveChild = group.items.some((it) => isActive(it.href));
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wider transition-colors",
          hasActiveChild
            ? "text-brand-deep dark:text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <GroupIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
        <span className="flex-1 truncate">{t(group.titleKey)}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>
      {open && (
        <ul className="mb-2 mt-1 space-y-0.5 pl-1">
          {group.items.map((item) => (
            <li key={item.labelKey}>
              <ItemLink
                item={item}
                collapsed={false}
                active={isActive(item.href)}
                label={t(item.labelKey)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CompactItemList({
  nav,
  t,
  isActive,
}: {
  nav: ReturnType<typeof buildAdminNav>;
  t: (key: string) => string;
  isActive: (href: string) => boolean;
}) {
  return (
    <div className="mt-2 space-y-2">
      {nav.groups.map((group) => (
        <div
          key={group.key}
          className="space-y-0.5 border-t border-border/50 pt-2 first:border-t-0 first:pt-0"
        >
          {group.items.map((item) => (
            <ItemLink
              key={item.labelKey}
              item={item}
              collapsed={true}
              active={isActive(item.href)}
              label={t(item.labelKey)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
