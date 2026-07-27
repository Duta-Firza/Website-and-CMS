"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import { renderInline } from "./rich";

/** Screenshot figure. Loads the committed image from the gated asset route; if
 *  it isn't there yet, shows a labelled placeholder (authoring aid). */
export function Figure({ code, caption, url }: { code: string; caption: string; url?: string }) {
  const [broken, setBroken] = useState(false);
  const src = `/api/dev/asset/manual/images/${code}.jpg`;
  return (
    <figure className="my-6 break-inside-avoid">
      {broken ? (
        <div className="flex min-h-[150px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
          [ {code} — belum ada gambar ]
        </div>
      ) : (
        // biome-ignore lint/performance/noImgElement: gated dynamic asset — next/image's optimizer can't forward the dev-session cookie
        <img
          src={src}
          alt={caption}
          onError={() => setBroken(true)}
          className="w-full rounded-lg border border-border"
        />
      )}
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
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
    >
      <Printer className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
