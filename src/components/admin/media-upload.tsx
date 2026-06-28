"use client";

import { ExternalLink, FileText, ImageOff, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { CropDialog } from "@/components/admin/crop-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Accept = "image" | "video" | "pdf";

const ACCEPT_MAP: Record<Accept, string> = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/webm",
  pdf: "application/pdf",
};

const ACCEPT_LABEL: Record<Accept, string> = {
  image: "JPG, PNG, WEBP",
  video: "MP4, WEBM",
  pdf: "PDF",
};

interface Props {
  value: string;
  onChange: (url: string) => void;
  accept: Accept;
  folder: string;
  className?: string;
  /** Admin-facing hint shown below the dropzone (e.g. recommended size + format). */
  hint?: string;
  /** When set on an image upload, open the crop dialog before uploading and
   * enforce this width/height ratio (e.g. `16/9`, `4/5`). */
  aspectRatio?: number;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function basename(url: string): string {
  try {
    const u = new URL(url, "https://example.com");
    const segs = u.pathname.split("/");
    return decodeURIComponent(segs[segs.length - 1] || url);
  } catch {
    return url.split("/").pop() ?? url;
  }
}

export function MediaUpload({
  value,
  onChange,
  accept,
  folder,
  className,
  hint,
  aspectRatio,
}: Props) {
  const t = useTranslations("Admin");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lastStats, setLastStats] = useState<{ orig: number; comp: number } | null>(null);
  const [cropSource, setCropSource] = useState<{
    src: string;
    mime: string;
    filename: string;
    rawFile: File;
  } | null>(null);
  const fileInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const accept_ = ACCEPT_MAP[accept];

  const handleIncoming = (file: File) => {
    if (!file) return;
    // If a crop ratio is requested for an image upload, run the crop UI first
    // and let the cropped File continue through the same upload pipeline.
    if (accept === "image" && aspectRatio && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const src = typeof reader.result === "string" ? reader.result : "";
        if (src) {
          setCropSource({ src, mime: file.type, filename: file.name, rawFile: file });
        }
      };
      reader.readAsDataURL(file);
      return;
    }
    void upload(file);
  };

  const upload = async (file: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        originalSize?: number;
        compressedSize?: number;
      };
      if (!res.ok || !data.url) {
        toast.error(data.error || t("mediaUpload.uploadFailed"));
        return;
      }
      onChange(data.url);
      if (data.originalSize && data.compressedSize) {
        setLastStats({ orig: data.originalSize, comp: data.compressedSize });
        const pct = Math.max(0, Math.round((1 - data.compressedSize / data.originalSize) * 100));
        toast.success(
          `${t("mediaUpload.uploadSuccess")} — ${t("mediaUpload.uploadStats", {
            orig: formatBytes(data.originalSize),
            comp: formatBytes(data.compressedSize),
            pct,
          })}`,
        );
      } else {
        toast.success(t("mediaUpload.uploadSuccess"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("mediaUpload.uploadFailed"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleIncoming(f);
  };

  const hasValue = Boolean(value);

  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drop zone is a visual region */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-lg border border-dashed bg-muted/30 transition-colors",
          dragOver && "border-brand-accent bg-brand-accent/5",
          busy && "opacity-60",
        )}
      >
        {hasValue ? (
          <Preview value={value} accept={accept} aspectRatio={aspectRatio} />
        ) : (
          <EmptyState accept={accept} />
        )}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t px-3 py-2">
          <label
            htmlFor={fileInputId}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted",
              busy && "pointer-events-none opacity-50",
            )}
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {busy ? t("buttons.uploading") : hasValue ? t("buttons.replace") : t("buttons.upload")}
          </label>
          {hasValue && !busy && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                setLastStats(null);
              }}
              className="h-8 text-xs"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              {t("buttons.remove")}
            </Button>
          )}
          <input
            id={fileInputId}
            ref={inputRef}
            type="file"
            accept={accept_}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleIncoming(f);
            }}
          />
        </div>
      </div>
      <p className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span>{t("mediaUpload.dropHint", { types: ACCEPT_LABEL[accept] })}</span>
        {lastStats && (
          <span className="font-mono">
            {formatBytes(lastStats.orig)} → {formatBytes(lastStats.comp)}
          </span>
        )}
      </p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {hasValue && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer noopener"
          title={value}
          className="flex max-w-full items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-accent"
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="min-w-0 truncate font-mono">{basename(value)}</span>
        </a>
      )}
      {cropSource && aspectRatio && (
        <CropDialog
          open
          src={cropSource.src}
          mime={cropSource.mime}
          filename={cropSource.filename}
          aspectRatio={aspectRatio}
          onCancel={() => {
            setCropSource(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          onConfirm={(file) => {
            setCropSource(null);
            void upload(file);
          }}
          onConfirmRaw={() => {
            const raw = cropSource.rawFile;
            setCropSource(null);
            void upload(raw);
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ accept }: { accept: Accept }) {
  const t = useTranslations("Admin.mediaUpload");
  const Icon = accept === "pdf" ? FileText : ImageOff;
  return (
    <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
      <Icon className="h-6 w-6 opacity-60" />
      <p className="text-xs">{t("noMedia")}</p>
    </div>
  );
}

function aspectClass(ratio?: number): string {
  if (!ratio) return "max-h-64";
  if (Math.abs(ratio - 16 / 9) < 0.01) return "aspect-video";
  if (Math.abs(ratio - 4 / 3) < 0.01) return "aspect-[4/3]";
  if (Math.abs(ratio - 4 / 5) < 0.01) return "aspect-[4/5]";
  if (Math.abs(ratio - 3 / 4) < 0.01) return "aspect-[3/4]";
  if (Math.abs(ratio - 1) < 0.01) return "aspect-square";
  return "max-h-64";
}

function Preview({
  value,
  accept,
  aspectRatio,
}: {
  value: string;
  accept: Accept;
  aspectRatio?: number;
}) {
  if (accept === "video") {
    return (
      <div className="relative mx-auto max-w-2xl overflow-hidden bg-black/5">
        <div className="relative aspect-video">
          <video src={value} controls preload="metadata" className="h-full w-full object-contain">
            <track kind="captions" />
          </video>
        </div>
      </div>
    );
  }
  if (accept === "pdf") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer noopener"
        className="flex h-32 items-center justify-center gap-3 px-4 text-sm text-brand-deep hover:text-brand-accent dark:text-foreground"
      >
        <FileText className="h-8 w-8 shrink-0 opacity-60" />
        <span className="min-w-0 truncate font-medium">{basename(value)}</span>
      </a>
    );
  }
  return (
    <div
      className={cn(
        "bg-checker relative mx-auto overflow-hidden",
        aspectClass(aspectRatio),
        aspectRatio ? "max-w-2xl" : "max-w-2xl",
      )}
    >
      <Image
        src={value}
        alt="Uploaded media"
        width={1600}
        height={900}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
