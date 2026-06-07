"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  alt: string;
  invertOnDark?: boolean;
  /** Thumbnail size class — defaults to a 12x12 cell suitable for compact tables. */
  thumbClassName?: string;
}

/**
 * Small clickable thumbnail used in admin tables. Renders a fallback icon when
 * src is empty so empty rows remain interactive (matches column width). Click
 * opens a Dialog with the full image preview.
 */
export function ImagePreview({ src, alt, invertOnDark, thumbClassName }: Props) {
  const [open, setOpen] = useState(false);

  if (!src) {
    return (
      <span
        title="No image"
        className={cn(
          "inline-flex h-12 w-12 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground",
          thumbClassName,
        )}
      >
        <ImageOff className="h-4 w-4" />
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Preview ${alt}`}
        className={cn(
          "group/img-thumb relative inline-flex h-12 w-12 shrink-0 cursor-zoom-in items-center justify-center overflow-hidden rounded-md border bg-muted/40 transition-all hover:border-brand-accent/40 hover:shadow-sm",
          thumbClassName,
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          className={cn(
            "h-full w-full object-contain p-1 transition-transform duration-200 group-hover/img-thumb:scale-105",
            invertOnDark && "dark:invert",
          )}
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(90vw,48rem)] max-w-[90vw] overflow-hidden">
          <DialogHeader className="min-w-0">
            <DialogTitle className="min-w-0 truncate text-base" title={alt}>
              {alt}
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-muted/30 p-4">
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={800}
              className={cn(
                "max-h-[70vh] max-w-full object-contain",
                invertOnDark && "dark:invert",
              )}
            />
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
