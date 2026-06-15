"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SectionMode } from "@/models/constants";

interface Props {
  value: SectionMode;
  onChange: (next: SectionMode) => void;
  /** Label shown beside the section-enabled Switch. */
  label?: string;
}

export function SectionModeToggle({ value, onChange, label }: Props) {
  const t = useTranslations("Admin.modes");
  const switchId = useId();
  const enabled = value !== "disabled";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor={switchId} className="flex items-center gap-2 text-sm font-medium">
        <Switch
          id={switchId}
          checked={enabled}
          onCheckedChange={(checked) => onChange(checked ? "default" : "disabled")}
          aria-label={t("sectionEnabled")}
        />
        <span>{label ?? t("sectionEnabled")}</span>
      </label>

      {enabled && (
        <div className="inline-flex rounded-md border bg-card p-0.5">
          <button
            type="button"
            onClick={() => onChange("default")}
            aria-pressed={value === "default"}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              value === "default"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {t("useDefault")}
          </button>
          <button
            type="button"
            onClick={() => onChange("custom")}
            aria-pressed={value === "custom"}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              value === "custom"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {t("useCustom")}
          </button>
        </div>
      )}
    </div>
  );
}
