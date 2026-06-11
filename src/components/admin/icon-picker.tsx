"use client";

import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { pickIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (name: string) => void;
  icons: readonly string[];
  className?: string;
}

export function IconPicker({ value, onChange, icons, className }: Props) {
  const t = useTranslations("Admin");
  const [open, setOpen] = useState(false);
  const Current = pickIcon(value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm transition-colors hover:bg-muted/60",
          className,
        )}
      >
        <span className="inline-flex items-center gap-2">
          <Current className="h-4 w-4 text-brand-deep dark:text-foreground" />
          <span className="font-mono text-xs text-muted-foreground">{value || "—"}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("iconPicker.title")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {icons.map((name) => {
              const Icon = pickIcon(name);
              const selected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={cn(
                    "group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-md border bg-card p-2 text-muted-foreground transition-all hover:border-brand-accent/40 hover:text-foreground",
                    selected && "border-brand-accent bg-brand-accent/10 text-brand-accent",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate text-[10px] font-medium">{name}</span>
                  {selected && (
                    <Check className="absolute right-1 top-1 h-3 w-3 text-brand-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
