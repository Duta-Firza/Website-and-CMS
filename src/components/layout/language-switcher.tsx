"use client";

import { Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Locale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALES: Record<Locale, { name: string; flag: string }> = {
  id: { name: "Indonesia", flag: "🇮🇩" },
  en: { name: "English", flag: "🇬🇧" },
};

export function LanguageSwitcher() {
  const t = useTranslations("Common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    const segments = pathname.split("/");
    if (routing.locales.includes(segments[1] as Locale)) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    const newPath = segments.join("/") || `/${next}`;
    startTransition(() => router.replace(newPath));
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={t("language")}
        disabled={isPending}
        openOnHover
        delay={100}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider",
        )}
      >
        <Globe className="h-4 w-4" />
        {locale}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchTo(loc)}
            data-active={loc === locale}
            className="gap-2 data-[active=true]:font-semibold"
          >
            <span className="text-base leading-none" aria-hidden>
              {LOCALES[loc].flag}
            </span>
            {LOCALES[loc].name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
