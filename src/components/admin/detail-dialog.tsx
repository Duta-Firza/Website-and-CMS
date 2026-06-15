"use client";

import { Check, ExternalLink, ImageOff, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { MediaLightbox } from "@/components/admin/media-lightbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type LocalizedValue = { id?: string; en?: string };

export type DetailFieldType =
  | "text"
  | "longtext"
  | "localized"
  | "localizedLongtext"
  | "image"
  | "imageList"
  | "video"
  | "url"
  | "boolean"
  | "list"
  | "icon"
  | "custom";

export interface DetailField {
  label: string;
  value: unknown;
  type?: DetailFieldType;
  custom?: ReactNode;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: DetailField[];
}

export function DetailDialog({ open, onClose, title, fields }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate">{title}</DialogTitle>
        </DialogHeader>
        <dl className="divide-y divide-border">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-1 gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[160px_1fr] sm:gap-4"
            >
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {f.label}
              </dt>
              <dd className="min-w-0 break-words text-sm">
                <FieldValue field={f} />
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function FieldValue({ field }: { field: DetailField }) {
  const { type = "text", value, custom } = field;

  if (type === "custom") return <>{custom}</>;

  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  switch (type) {
    case "boolean":
      return <BooleanValue value={Boolean(value)} />;
    case "url":
      return <UrlValue value={String(value)} />;
    case "image":
      return <ImageValue src={String(value)} alt={field.label} />;
    case "imageList":
      return <ImageListValue value={value} label={field.label} />;
    case "video":
      return <VideoValue src={String(value)} label={field.label} />;
    case "localized":
      return <LocalizedValueRow value={value as LocalizedValue} />;
    case "localizedLongtext":
      return <LocalizedValueRow value={value as LocalizedValue} multiline />;
    case "longtext":
      return <p className="whitespace-pre-wrap text-sm">{String(value)}</p>;
    case "list":
      return <ListValue value={value} />;
    case "icon":
      return <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{String(value)}</code>;
    default:
      return <span>{String(value)}</span>;
  }
}

function BooleanValue({ value }: { value: boolean }) {
  const t = useTranslations("Admin.common");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        value
          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200"
          : "bg-muted text-muted-foreground",
      )}
    >
      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {value ? t("yes") : t("no")}
    </span>
  );
}

function UrlValue({ value }: { value: string }) {
  return (
    <a
      href={value}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 truncate font-mono text-xs text-brand-accent hover:underline"
    >
      <span className="truncate">{value}</span>
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  );
}

function ImageValue({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
        <ImageOff className="h-4 w-4" />
      </span>
    );
  }
  return (
    <MediaLightbox
      src={src}
      type="image"
      alt={alt}
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="inline-flex h-20 w-20 cursor-zoom-in items-center justify-center overflow-hidden rounded-md border bg-muted/40 transition-colors hover:border-brand-accent/40"
        >
          <Image
            src={src}
            alt={alt}
            width={160}
            height={160}
            className="h-full w-full object-contain p-1"
          />
        </button>
      )}
    />
  );
}

function ImageListValue({ value, label }: { value: unknown; label: string }) {
  if (!Array.isArray(value) || value.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {value.map((src, idx) => (
        <ImageValue
          key={typeof src === "string" ? src : idx}
          src={typeof src === "string" ? src : ""}
          alt={`${label} ${idx + 1}`}
        />
      ))}
    </div>
  );
}

function VideoValue({ src, label }: { src: string; label: string }) {
  return (
    <MediaLightbox
      src={src}
      type="video"
      alt={label}
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs font-medium transition-colors hover:border-brand-accent/40 hover:text-brand-accent"
        >
          <span>▶</span>
          <span>{label}</span>
        </button>
      )}
    />
  );
}

function LocalizedValueRow({ value, multiline }: { value: LocalizedValue; multiline?: boolean }) {
  const id = value?.id ?? "";
  const en = value?.en ?? "";
  if (!id && !en) return <span className="text-muted-foreground">—</span>;
  const Cls = multiline ? "whitespace-pre-wrap" : "truncate";
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded bg-muted px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          ID
        </span>
        <p className={cn("min-w-0 flex-1", Cls)}>{id || "—"}</p>
      </div>
      <div className="flex gap-2">
        <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded bg-muted px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          EN
        </span>
        <p className={cn("min-w-0 flex-1", Cls)}>{en || "—"}</p>
      </div>
    </div>
  );
}

function ListValue({ value }: { value: unknown }) {
  if (!Array.isArray(value) || value.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <ul className="list-disc space-y-0.5 pl-4 text-sm">
      {value.map((v, i) => (
        <li key={typeof v === "string" ? v : i}>{typeof v === "string" ? v : JSON.stringify(v)}</li>
      ))}
    </ul>
  );
}
