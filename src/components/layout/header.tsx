"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DesktopNav } from "./desktop-nav";
import { HeaderOverlayContext } from "./header-context";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import type { NavVisibilityMap } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

const SCROLL_THRESHOLD = 80;

export function Header({ visibility }: { visibility: NavVisibilityMap }) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname() ?? "";
  const isLanding = pathname === `/${locale}` || pathname === `/${locale}/`;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Overlay = floating over a dark hero photo (landing page top only).
  // Everywhere else the header has its normal background.
  const overlay = isLanding && !scrolled;

  return (
    <HeaderOverlayContext.Provider value={overlay}>
      <header
        data-overlay={overlay}
        className={cn(
          "fixed top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter,color] duration-300",
          overlay
            ? "border-b border-transparent bg-transparent text-white"
            : "border-b bg-background/80 text-foreground backdrop-blur supports-backdrop-filter:bg-background/60",
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link href={`/${locale}`} aria-label={t("companyName")} className="flex items-center">
            <Logo
              className={cn(
                "h-10 transition-[filter] duration-300",
                overlay ? "brightness-0 invert" : "dark:brightness-0 dark:invert",
              )}
            />
          </Link>

          <DesktopNav visibility={visibility} />

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/contact`}
              className={cn(
                buttonVariants({ variant: "brand", size: "sm" }),
                "hidden md:inline-flex",
              )}
            >
              {t("contactUs")}
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
            <MobileNav visibility={visibility} />
          </div>
        </div>
      </header>
    </HeaderOverlayContext.Provider>
  );
}
