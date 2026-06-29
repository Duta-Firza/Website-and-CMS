import { FileText } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  /** Resolved image URL; when empty a muted document placeholder is shown. */
  src?: string;
  alt: string;
  className?: string;
}

/**
 * 16:9 thumbnail for Investor Relations cards (reports / publications). Renders
 * the image when present, otherwise a neutral placeholder — avoids depending on
 * an SVG asset (next/image blocks SVG unless `dangerouslyAllowSVG`).
 */
export function IrThumbnail({ src, alt, className }: Props) {
  return (
    <div className={cn("relative aspect-video overflow-hidden bg-muted", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground/30">
          <FileText className="h-10 w-10" />
        </div>
      )}
    </div>
  );
}
