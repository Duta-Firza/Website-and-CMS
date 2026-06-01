"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { buildAdminNav } from "./admin-nav-data";

export function AdminSidebar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("AdminNav");
  const tCommon = useTranslations("Common");
  const sections = buildAdminNav(locale);

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href={`/${locale}/admin`} className="text-sm font-semibold tracking-tight">
          {tCommon("companyName")}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-6">
          {sections.map((section) => (
            <li key={section.titleKey}>
              <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t(section.titleKey)}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  return (
                    <li key={item.labelKey}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
