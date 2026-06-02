"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
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
import { buildNav, type NavSub, type NavTop } from "./main-nav";

export function MobileNav() {
  const t = useTranslations("Nav");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const items = buildNav(locale);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
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
            {items.map((item) =>
              item.children && item.children.length > 0 ? (
                <MobileTopAccordion key={item.labelKey} item={item} t={t} close={close} />
              ) : (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  onClick={close}
                  className="flex items-center border-b px-2 py-3.5 text-base font-medium"
                >
                  {t(item.labelKey)}
                </Link>
              ),
            )}
          </Accordion>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileTopAccordion({
  item,
  t,
  close,
}: {
  item: NavTop;
  t: ReturnType<typeof useTranslations>;
  close: () => void;
}) {
  return (
    <AccordionItem value={item.labelKey}>
      <AccordionTrigger className="px-2 py-3.5 text-base font-medium">
        {t(item.labelKey)}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-0.5 pl-3">
          {/* Direct top-link entry for quick access to the section landing page */}
          <Link
            href={item.href}
            onClick={close}
            className="block rounded-md px-3 py-2 text-sm italic text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {`→ ${t(item.labelKey)}`}
          </Link>

          {item.children?.map((sub) =>
            sub.children && sub.children.length > 0 ? (
              <MobileSubAccordion key={sub.labelKey} sub={sub} t={t} close={close} />
            ) : (
              <Link
                key={sub.labelKey}
                href={sub.href}
                onClick={close}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {t(sub.labelKey)}
              </Link>
            ),
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function MobileSubAccordion({
  sub,
  t,
  close,
}: {
  sub: NavSub;
  t: ReturnType<typeof useTranslations>;
  close: () => void;
}) {
  return (
    <Accordion>
      <AccordionItem value={sub.labelKey}>
        <AccordionTrigger className="rounded-md px-3 py-2 text-sm">
          {t(sub.labelKey)}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-0.5 pl-3">
            <Link
              href={sub.href}
              onClick={close}
              className="block rounded-md px-3 py-1.5 text-xs italic text-muted-foreground hover:bg-muted"
            >
              {`→ ${t(sub.labelKey)}`}
            </Link>
            {sub.children?.map((subSub) => (
              <Link
                key={subSub.labelKey}
                href={subSub.href}
                onClick={close}
                className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {t(subSub.labelKey)}
              </Link>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
