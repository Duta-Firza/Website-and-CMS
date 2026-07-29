"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useHeaderOverlay } from "./header-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Common");
  const overlay = useHeaderOverlay();

  // `theme` is only known on the client; guard against hydration mismatch so
  // the active highlight doesn't flash on first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = [
    { value: "light", label: t("themeLight"), Icon: Sun },
    { value: "dark", label: t("themeDark"), Icon: Moon },
    { value: "system", label: t("themeSystem"), Icon: Monitor },
  ] as const;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={t("theme")}
        openOnHover
        delay={100}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative",
          overlay && "text-white hover:bg-white/10 hover:text-white",
        )}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">{t("theme")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map(({ value, label, Icon }) => {
          const active = mounted && theme === value;
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className={cn(active && "bg-primary/10 text-primary focus:text-primary")}
            >
              <Icon className={cn("mr-2 h-4 w-4", active && "text-primary")} />
              {label}
              {active && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
