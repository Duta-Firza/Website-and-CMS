"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  type: "image" | "video";
  trigger: (open: () => void) => ReactNode;
  alt?: string;
  invertOnDark?: boolean;
}

export function MediaLightbox({ src, type, trigger, alt, invertOnDark }: Props) {
  const t = useTranslations("Admin");
  const [open, setOpen] = useState(false);
  const label = alt ?? t("altImage.fullPreview");

  return (
    <>
      {trigger(() => setOpen(true))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(95vw,72rem)] max-w-[95vw] overflow-hidden">
          <DialogHeader className="min-w-0">
            <DialogTitle className="min-w-0 truncate text-base" title={label}>
              {label}
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-muted/30 p-4">
            {type === "image" ? (
              <Image
                src={src}
                alt={label}
                width={1920}
                height={1080}
                className={cn(
                  "max-h-[80vh] max-w-full object-contain",
                  invertOnDark && "dark:invert",
                )}
              />
            ) : (
              <video
                src={src}
                controls
                autoPlay
                preload="metadata"
                className="max-h-[80vh] max-w-full"
              >
                <track kind="captions" />
              </video>
            )}
          </div>
          <a
            href={src}
            target="_blank"
            rel="noreferrer noopener"
            title={src}
            className="block min-w-0 max-w-full truncate font-mono text-xs text-muted-foreground hover:text-brand-accent"
          >
            {src}
          </a>
        </DialogContent>
      </Dialog>
    </>
  );
}
