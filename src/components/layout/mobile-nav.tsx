"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useHeaderOverlay } from "./header-context";
import {
  applyVisibilityToNav,
  buildNav,
  type NavSub,
  type NavTop,
  type NavVisibilityMap,
} from "./main-nav";
import { findActiveHref, isExactActive, isTopActive } from "./nav-active";

export function MobileNav({ visibility }: { visibility: NavVisibilityMap }) {
  const t = useTranslations("Nav");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const items = applyVisibilityToNav(buildNav(locale), visibility);
  const close = () => setOpen(false);
  const activeHref = findActiveHref(items, pathname);
  const overlay = useHeaderOverlay();
  const comingSoonLabel = tc("comingSoon");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "md:hidden",
          overlay && "text-white hover:bg-white/10 hover:text-white",
        )}
        aria-label={tc("openMenu")}
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>{tc("companyName")}</SheetTitle>
        </SheetHeader>
        <nav className="mt-2 overflow-y-auto px-2 pb-8">
          <Accordion>
            {items.map((item) => {
              const topActive = isTopActive(activeHref, item.href);
              if (item.children && item.children.length > 0) {
                return (
                  <MobileTopAccordion
                    key={item.labelKey}
                    item={item}
                    t={t}
                    comingSoonLabel={comingSoonLabel}
                    close={close}
                    topActive={topActive}
                    activeHref={activeHref}
                  />
                );
              }
              return (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  onClick={close}
                  aria-current={topActive ? "page" : undefined}
                  className={cn(
                    "flex items-center border-b px-2 py-3.5 text-base",
                    topActive
                      ? "font-semibold text-brand-deep dark:text-foreground"
                      : "font-medium",
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </Accordion>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileTopAccordion({
  item,
  t,
  comingSoonLabel,
  close,
  topActive,
  activeHref,
}: {
  item: NavTop;
  t: ReturnType<typeof useTranslations>;
  comingSoonLabel: string;
  close: () => void;
  topActive: boolean;
  activeHref: string | undefined;
}) {
  const topRowExactActive = isExactActive(activeHref, item.href);
  return (
    <AccordionItem value={item.labelKey}>
      <AccordionTrigger
        className={cn(
          "px-2 py-3.5 text-base",
          topActive
            ? "font-semibold text-brand-deep dark:text-foreground [&_svg]:stroke-[2.5]"
            : "font-medium",
        )}
      >
        {t(item.labelKey)}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-0.5 pl-3">
          {/* Direct top-link entry — clicking this jumps to the section landing page */}
          <Link
            href={item.href}
            onClick={close}
            aria-current={topRowExactActive ? "page" : undefined}
            className={cn(
              "block rounded-md px-3 py-2 text-sm italic hover:bg-muted hover:text-foreground",
              topRowExactActive
                ? "font-semibold text-brand-deep dark:text-foreground"
                : "text-muted-foreground",
            )}
          >
            {`→ ${t(item.labelKey)}`}
          </Link>

          {item.children?.map((sub) => {
            const subActive = isExactActive(activeHref, sub.href);
            if (sub.children && sub.children.length > 0) {
              return (
                <MobileSubAccordion
                  key={sub.labelKey}
                  sub={sub}
                  t={t}
                  comingSoonLabel={comingSoonLabel}
                  close={close}
                  activeHref={activeHref}
                />
              );
            }
            return (
              <Link
                key={sub.labelKey}
                href={sub.href}
                onClick={close}
                aria-current={subActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground",
                  subActive
                    ? "font-semibold text-brand-deep dark:text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {t(sub.labelKey)}
                {sub.comingSoon && (
                  <span className="rounded-sm bg-amber-500/20 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {comingSoonLabel}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function MobileSubAccordion({
  sub,
  t,
  comingSoonLabel,
  close,
  activeHref,
}: {
  sub: NavSub;
  t: ReturnType<typeof useTranslations>;
  comingSoonLabel: string;
  close: () => void;
  activeHref: string | undefined;
}) {
  const subRowExactActive = isExactActive(activeHref, sub.href);
  const anyChildActive = sub.children?.some((ss) => isExactActive(activeHref, ss.href)) ?? false;
  const subBranchActive = subRowExactActive || anyChildActive;
  return (
    <Accordion>
      <AccordionItem value={sub.labelKey}>
        <AccordionTrigger
          className={cn(
            "rounded-md px-3 py-2 text-sm",
            subBranchActive &&
              "font-semibold text-brand-deep dark:text-foreground [&_svg]:stroke-[2.5]",
          )}
        >
          {t(sub.labelKey)}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-0.5 pl-3">
            <Link
              href={sub.href}
              onClick={close}
              aria-current={subRowExactActive ? "page" : undefined}
              className={cn(
                "block rounded-md px-3 py-1.5 text-xs italic hover:bg-muted",
                subRowExactActive
                  ? "font-semibold text-brand-deep dark:text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {`→ ${t(sub.labelKey)}`}
            </Link>
            {sub.children?.map((subSub) => {
              const ssActive = isExactActive(activeHref, subSub.href);
              return (
                <Link
                  key={subSub.labelKey}
                  href={subSub.href}
                  onClick={close}
                  aria-current={ssActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-muted hover:text-foreground",
                    ssActive
                      ? "font-semibold text-brand-deep dark:text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {t(subSub.labelKey)}
                  {subSub.comingSoon && (
                    <span className="rounded-sm bg-amber-500/20 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {comingSoonLabel}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
