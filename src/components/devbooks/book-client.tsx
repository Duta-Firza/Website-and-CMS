"use client";

import { Loader2, Printer, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { renderInline } from "./rich";

type Status = "loading" | "has" | "empty";

const MAX_DIM = 1600;
const QUALITY = 0.85;

/** Compress to JPEG via canvas; falls back to the original file on any error. */
async function compress(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", QUALITY),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

/**
 * Screenshot figure with in-app authoring: drag-and-drop / click to upload,
 * plus replace + delete. Images are written (gated) to
 * content/devbooks/manual/images/<code>.jpg so they persist for git + print.
 * All controls are screen-only (no-print).
 */
export function Figure({ code, caption, url }: { code: string; caption: string; url?: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [ver, setVer] = useState(0);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const filename = `${code}.jpg`;
  const endpoint = `/api/dev/asset/manual/images/${filename}`;
  const src = `${endpoint}${ver ? `?v=${ver}` : ""}`;

  // The <img> is server-rendered, so its load/error can fire before React
  // hydrates (missing the onError). On mount, reconcile from the DOM state;
  // later changes are handled by onLoad/onError (attached after hydration).
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) setStatus(img.naturalWidth > 0 ? "has" : "empty");
  }, []);

  async function upload(file: File | undefined | null) {
    if (!file?.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const blob = await compress(file);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "image/jpeg" },
        body: blob,
      });
      if (res.ok) {
        setVer(Date.now());
        setStatus("has");
      } else {
        alert("Gagal mengunggah gambar.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Hapus gambar ${code}?`)) return;
    setBusy(true);
    try {
      await fetch(endpoint, { method: "DELETE" });
      setStatus("empty");
    } finally {
      setBusy(false);
    }
  }

  return (
    <figure className="my-6 break-inside-avoid">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drop zone wraps its own button + input */}
      <div
        className={cn("relative", drag && "ring-2 ring-brand-primary ring-offset-2")}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          upload(e.dataTransfer.files?.[0]);
        }}
      >
        {status !== "empty" && (
          // biome-ignore lint/performance/noImgElement: gated dynamic asset — next/image's optimizer can't forward the dev-session cookie
          <img
            ref={imgRef}
            src={src}
            alt={caption}
            onLoad={() => setStatus("has")}
            onError={() => setStatus("empty")}
            className="w-full rounded-lg border border-border"
          />
        )}

        {status === "empty" && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="no-print flex min-h-40 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground transition-colors hover:border-brand-primary hover:text-foreground"
            >
              <Upload className="h-5 w-5" />
              <span>Seret gambar ke sini atau klik untuk unggah</span>
              <span className="font-mono text-xs text-brand-primary">{code}</span>
            </button>
            {/* Print-only marker so the PDF shows a labelled gap, not the uploader. */}
            <div className="hidden min-h-30 items-center justify-center rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground print:flex">
              [ {code} ]
            </div>
          </>
        )}

        {status === "has" && (
          <div className="no-print absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 rounded-md border border-black/10 bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 shadow-sm hover:bg-white"
            >
              <Upload className="h-3 w-3" /> Ganti
            </button>
            <button
              type="button"
              onClick={remove}
              className="flex items-center gap-1 rounded-md border border-black/10 bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow-sm hover:bg-white"
            >
              <Trash2 className="h-3 w-3" /> Hapus
            </button>
          </div>
        )}

        {busy && (
          <div className="no-print absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 text-sm text-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses…
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      <figcaption className="mt-2 text-sm text-muted-foreground">
        <span className="mr-1.5 inline-block rounded bg-brand-deep px-1.5 py-0.5 font-mono text-xs font-semibold text-white dark:bg-brand-primary">
          {code}
        </span>
        {renderInline(caption)}
        {url ? <span className="ml-1 font-mono text-xs text-brand-primary">{url}</span> : null}
      </figcaption>
    </figure>
  );
}

export function PrintButton({ label = "Cetak / PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-deep"
    >
      <Printer className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
