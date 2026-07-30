"use client";

import { CheckCircle2, ExternalLink, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Publish panel on /devbooks: upload the FINAL manual-book PDF (per language)
 * to GCS so /admin/manual-book can show it. Workflow: generate the PDF from
 * /devbooks/manual/[lang]/print (Save as PDF), then upload it here. The admin
 * view only changes after a new upload — it never reflects live /devbooks edits.
 */
function Slot({ lang, label, initial }: { lang: "id" | "en"; label: string; initial: string }) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File | undefined | null) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErr("Hanya file PDF.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("lang", lang);
      const res = await fetch("/api/dev/manual-upload", { method: "POST", body: fd });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (res.ok && data.url) setUrl(data.url);
      else setErr(data.error || "Gagal mengunggah.");
    } catch {
      setErr("Gagal terhubung. Coba lagi.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            url ? "bg-brand-primary/10 text-brand-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {url ? <CheckCircle2 className="h-3 w-3" /> : null}
          {url ? "Terpublikasi" : "Belum ada"}
        </span>
      </div>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="mb-3 inline-flex items-center gap-1 text-xs text-brand-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" /> Lihat PDF terpublikasi
        </a>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {busy ? "Mengunggah…" : url ? "Ganti PDF" : "Unggah PDF"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}

export function ManualPublish({ initialId, initialEn }: { initialId: string; initialEn: string }) {
  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Publikasikan PDF ke Admin</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        Generate PDF dari tombol <b>Buat PDF</b> di tiap buku, simpan sebagai PDF, lalu unggah di
        sini. PDF diunggah ke Google Cloud Storage dan tampil di{" "}
        <code className="rounded border border-border bg-muted px-1 font-mono text-[0.85em]">
          /admin/manual-book
        </code>
        . Perubahan baru terlihat admin setelah diunggah ulang.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slot lang="id" label="Manual Book · Bahasa Indonesia" initial={initialId} />
        <Slot lang="en" label="Manual Book · English" initial={initialEn} />
      </div>
    </section>
  );
}
