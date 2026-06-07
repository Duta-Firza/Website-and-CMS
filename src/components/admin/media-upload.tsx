"use client";

import { ExternalLink, FileText, ImageOff, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
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

export function MediaUpload({ value, onChange, accept, folder, className }: Props) {
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lastStats, setLastStats] = useState<{ orig: number; comp: number } | null>(null);
  const fileInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

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
        toast.error(data.error || "Upload failed");
        return;
      }
      onChange(data.url);
      if (data.originalSize && data.compressedSize) {
        setLastStats({ orig: data.originalSize, comp: data.compressedSize });
        const pct = Math.max(0, Math.round((1 - data.compressedSize / data.originalSize) * 100));
        toast.success(
          `Uploaded — ${formatBytes(data.originalSize)} → ${formatBytes(data.compressedSize)} (${pct}% smaller)`,
        );
      } else {
        toast.success("Uploaded");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void upload(f);
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
        {hasValue ? <Preview value={value} accept={accept} /> : <EmptyState accept={accept} />}
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
            {busy ? "Mengunggah…" : hasValue ? "Replace" : "Upload"}
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
              Remove
            </Button>
          )}
          <input
            id={fileInputId}
            ref={inputRef}
            type="file"
            accept={ACCEPT_MAP[accept]}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
        </div>
      </div>
      <p className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span>Drag & drop atau klik Upload. Diterima: {ACCEPT_LABEL[accept]}.</span>
        {lastStats && (
          <span className="font-mono">
            {formatBytes(lastStats.orig)} → {formatBytes(lastStats.comp)}
          </span>
        )}
      </p>
      {hasValue && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer noopener"
          title={value}
          className="inline-flex max-w-full items-center gap-1 truncate text-[11px] text-muted-foreground hover:text-brand-accent"
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="truncate font-mono">{basename(value)}</span>
        </a>
      )}
    </div>
  );
}

function EmptyState({ accept }: { accept: Accept }) {
  const Icon = accept === "pdf" ? FileText : ImageOff;
  return (
    <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
      <Icon className="h-6 w-6 opacity-60" />
      <p className="text-xs">Belum ada media</p>
    </div>
  );
}

function Preview({ value, accept }: { value: string; accept: Accept }) {
  if (accept === "video") {
    return (
      <div className="relative max-h-64 overflow-hidden bg-black/5">
        <video
          src={value}
          controls
          className="mx-auto max-h-64 w-full max-w-full"
          preload="metadata"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }
  if (accept === "pdf") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer noopener"
        className="flex h-32 items-center justify-center gap-3 text-sm text-brand-deep hover:text-brand-accent dark:text-foreground"
      >
        <FileText className="h-8 w-8 opacity-60" />
        <span className="truncate font-medium">{basename(value)}</span>
      </a>
    );
  }
  return (
    <div className="relative flex h-40 items-center justify-center overflow-hidden bg-checker">
      <Image
        src={value}
        alt="Uploaded media"
        width={1200}
        height={600}
        className="max-h-40 w-auto max-w-full object-contain"
      />
    </div>
  );
}
