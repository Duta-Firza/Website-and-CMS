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
import { buildNav } from "./main-nav";

export function MobileNav() {
  const t = useTranslations("Nav");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const items = buildNav(locale);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
        aria-label={tc("openMenu")}
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-75 sm:w-90">
        <SheetHeader>
          <SheetTitle>{tc("companyName")}</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 px-4 pb-6">
          <Accordion>
            {items.map((item) =>
              item.children ? (
                <AccordionItem key={item.labelKey} value={item.labelKey}>
                  <AccordionTrigger className="text-base">{t(item.labelKey)}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 pl-2">
                      {item.children.map((child) => (
                        <li key={child.labelKey}>
                          <Link
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            {t(child.labelKey)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center border-b py-3 text-base font-medium"
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
