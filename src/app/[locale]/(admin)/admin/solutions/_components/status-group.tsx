"use client";

import { Eye, EyeOff, Hourglass } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SolutionPageStatus } from "@/models/constants";

interface Props {
  value: SolutionPageStatus;
  onChange: (next: SolutionPageStatus) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

const OPTIONS: Array<{
  value: SolutionPageStatus;
  icon: typeof Eye;
  labelKey: string;
  descKey: string;
  activeClass: string;
}> = [
  {
    value: "published",
    icon: Eye,
    labelKey: "published",
    descKey: "publishedDesc",
    activeClass: "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    value: "comingSoon",
    icon: Hourglass,
    labelKey: "comingSoon",
    descKey: "comingSoonDesc",
    activeClass: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    value: "hidden",
    icon: EyeOff,
    labelKey: "hidden",
    descKey: "hiddenDesc",
    activeClass: "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  },
];

export function StatusGroup({ value, onChange, disabled, size = "md" }: Props) {
  const t = useTranslations("Admin.status");
  return (
    <div className={cn("grid gap-2", size === "sm" ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3")}>
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-start gap-3 rounded-md border bg-background p-3 text-left transition-colors",
              "hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
              active && opt.activeClass,
              size === "sm" && "p-2",
            )}
          >
            <Icon className={cn("mt-0.5 shrink-0", size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
            <div className="min-w-0">
              <p className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>
                {t(opt.labelKey)}
              </p>
              {size === "md" && (
                <p className="mt-0.5 text-xs text-muted-foreground">{t(opt.descKey)}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
