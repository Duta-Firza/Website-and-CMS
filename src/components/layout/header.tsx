import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { DesktopNav } from "./desktop-nav";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const t = useTranslations("Common");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href={`/${locale}`} aria-label={t("companyName")} className="flex items-center">
          <Logo className="h-8 dark:brightness-0 dark:invert" />
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
