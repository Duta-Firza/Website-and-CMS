"use client";

import { Download, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shows the uploaded manual-book PDF(s) inline (GCS URL), with a language
 * toggle so any language can be read from a single screen regardless of the
 * admin UI locale. Languages without an uploaded PDF are hidden.
 */
export function ManualBookViewer({ id, en }: { id: string; en: string }) {
  const t = useTranslations("Admin.manualBook");
  const available = (
    [
      { lang: "id" as const, label: t("langId"), url: id },
      { lang: "en" as const, label: t("langEn"), url: en },
    ] as const
  ).filter((x) => x.url);

  const [active, setActive] = useState<"id" | "en">(available[0]?.lang ?? "id");

  if (available.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/30 p-10 text-center">
        <p className="text-sm text-muted-foreground">{t("notUploaded")}</p>
      </div>
    );
  }

  const current = available.find((x) => x.lang === active) ?? available[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {available.length > 1 ? (
          <div className="flex rounded-md border border-border p-0.5">
            {available.map((x) => (
              <button
                key={x.lang}
                type="button"
                onClick={() => setActive(x.lang)}
                className={cn(
                  "rounded px-3 py-1 text-sm transition-colors",
                  active === x.lang
                    ? "bg-brand-primary text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {x.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-sm font-medium text-foreground">{current.label}</span>
        )}

        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/manual-book/download?lang=${current.lang}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {t("download")}
          </a>
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            {t("openNewTab")}
          </a>
        </div>
      </div>

      {/* view=FitH makes the PDF page fill the frame width (removes Chrome's
          left/right letterbox "black bars" around a portrait page). */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <iframe
          key={current.url}
          src={`${current.url}#toolbar=0&navpanes=0&view=FitH`}
          className="h-[80vh] w-full"
          title={current.label}
        />
      </div>
    </div>
  );
}
