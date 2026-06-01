import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { DesktopNav } from "./desktop-nav";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const t = useTranslations("Common");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link
          href={`/${locale}`}
          className="text-base font-semibold tracking-tight text-brand-deep dark:text-foreground"
        >
          {t("companyName")}
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
