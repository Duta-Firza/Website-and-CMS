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
import {
  type AdminNavGroup,
  type AdminNavItem,
  type AdminNavSection,
  buildAdminNav,
} from "./admin-nav-data";
import { SIDEBAR_COLLAPSED_COOKIE, SIDEBAR_OPEN_GROUPS_COOKIE } from "./admin-sidebar-cookies";

interface Props {
  initialCollapsed: boolean;
  initialOpenGroup: string | null;
  initialUnreadCount: number;
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

export function AdminSidebarShell({
  initialCollapsed,
  initialOpenGroup,
  initialUnreadCount,
  user,
}: Props) {
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
    for (const section of nav.sections) {
      for (const g of section.groups) {
        if (g.items.some((it) => isActive(it.href))) return g.key;
      }
    }
    return null;
  }, [nav, isActive]);

  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [openGroup, setOpenGroup] = useState<string | null>(initialOpenGroup ?? activeGroupKey);

  // Live unread-inquiries count via SSE. Seeded from the server-rendered value
  // so the badge is correct on first paint; EventSource auto-reconnects on drop.
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  useEffect(() => {
    const es = new EventSource("/api/admin/inquiries/unread-stream");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as { count?: number };
        if (typeof data.count === "number") setUnreadCount(data.count);
      } catch {
        // ignore malformed frame
      }
    };
    return () => es.close();
  }, []);

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
        {collapsed ? (
          <CompactSectionList
            sections={nav.sections}
            t={t}
            isActive={isActive}
            unreadCount={unreadCount}
          />
        ) : (
          <div className="space-y-4">
            {nav.sections.map((section) => (
              <SectionBlock
                key={section.key}
                section={section}
                openGroup={openGroup}
                onToggleGroup={toggleGroup}
                t={t}
                isActive={isActive}
                unreadCount={unreadCount}
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

function unreadFor(item: AdminNavItem, unreadCount: number): number {
  return item.badge === "unreadInquiries" ? unreadCount : 0;
}

function SectionBlock({
  section,
  openGroup,
  onToggleGroup,
  t,
  isActive,
  unreadCount,
}: {
  section: AdminNavSection;
  openGroup: string | null;
  onToggleGroup: (key: string) => void;
  t: (key: string) => string;
  isActive: (href: string) => boolean;
  unreadCount: number;
}) {
  // A section with a single group renders that group's items flat under the
  // section header (so "Inbox" isn't repeated as both a section and a group);
  // multi-group sections keep the collapsible group headers.
  const singleGroup = section.groups.length === 1 ? section.groups[0] : null;
  return (
    <div className="space-y-1">
      <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
        {t(section.titleKey)}
      </p>
      {singleGroup ? (
        <div className="space-y-0.5">
          {singleGroup.items.map((item) => (
            <ItemLink
              key={item.labelKey}
              item={item}
              collapsed={false}
              active={isActive(item.href)}
              label={t(item.labelKey)}
              badgeCount={unreadFor(item, unreadCount)}
            />
          ))}
        </div>
      ) : (
        section.groups.map((group) => (
          <GroupSection
            key={group.key}
            group={group}
            open={openGroup === group.key}
            onToggle={() => onToggleGroup(group.key)}
            t={t}
            isActive={isActive}
          />
        ))
      )}
    </div>
  );
}

function ItemLink({
  item,
  collapsed,
  active,
  label,
  badgeCount = 0,
}: {
  item: AdminNavItem;
  collapsed: boolean;
  active: boolean;
  label: string;
  badgeCount?: number;
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
  const showBadge = badgeCount > 0;
  return (
    <Link
      href={item.href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
        collapsed && "justify-center",
        active
          ? "bg-brand-accent/8 pl-1.5 text-brand-accent"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        collapsed && active && "border-l-0 pl-2",
      )}
    >
      <span className="relative shrink-0">
        <Icon className="h-4 w-4" />
        {collapsed && showBadge && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand-accent ring-2 ring-card" />
        )}
      </span>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && showBadge && (
        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-semibold leading-none text-white">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
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

  // Single-item groups (e.g. Home → Landing) render as a direct link instead
  // of a collapsible header — no caret, no indented child list. The group
  // title becomes the link label and points at the only item's href.
  if (group.items.length === 1) {
    const only = group.items[0];
    const active = isActive(only.href);
    return (
      <Link
        href={only.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wider transition-colors",
          active
            ? "bg-brand-accent/10 text-brand-deep dark:text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <GroupIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
        <span className="flex-1 truncate">{t(group.titleKey)}</span>
      </Link>
    );
  }

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
        <ul className="mb-2 ml-3 mt-1 space-y-0.5 border-l border-border/60 pl-3">
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

function CompactSectionList({
  sections,
  t,
  isActive,
  unreadCount,
}: {
  sections: AdminNavSection[];
  t: (key: string) => string;
  isActive: (href: string) => boolean;
  unreadCount: number;
}) {
  return (
    <div className="mt-2 space-y-2">
      {sections.map((section) => (
        <div
          key={section.key}
          className="space-y-0.5 border-t border-border/50 pt-2 first:border-t-0 first:pt-0"
        >
          {section.groups
            .flatMap((g) => g.items)
            .map((item) => (
              <ItemLink
                key={item.labelKey}
                item={item}
                collapsed={true}
                active={isActive(item.href)}
                label={t(item.labelKey)}
                badgeCount={unreadFor(item, unreadCount)}
              />
            ))}
        </div>
      ))}
    </div>
  );
}
