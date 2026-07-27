"use client";

import { ArrowLeft, Loader2, Printer } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Block, Book } from "@/content/devbooks/types";

interface PagedPreviewer {
  preview(
    content: string,
    stylesheets: string[],
    renderTo: HTMLElement,
  ): Promise<{ total: number }>;
}
declare global {
  interface Window {
    Paged?: { Previewer: new () => PagedPreviewer };
    PagedConfig?: { auto?: boolean };
  }
}

const POLYFILL_SRC = "/vendor/pagedjs/paged.polyfill.min.js";

// Load the self-contained Paged.js UMD polyfill once (bundling its ESM source
// via Turbopack breaks it, so it's served as a plain script instead).
function loadPagedPolyfill(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Paged?.Previewer) return resolve();
    window.PagedConfig = { auto: false }; // don't auto-paginate document.body
    const existing = document.querySelector<HTMLScriptElement>("script[data-pagedjs]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("pagedjs load failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = POLYFILL_SRC;
    s.async = true;
    s.dataset.pagedjs = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("pagedjs load failed"));
    document.head.appendChild(s);
  });
}

/**
 * Print-ready view. Builds the book as a static HTML string (committed images
 * only — no uploader) and hands it to Paged.js, which paginates it into A4
 * pages with a minimalist running header, page numbers in the footer, and real
 * page numbers next to every Daftar Isi entry (via CSS `target-counter`).
 * Authoring/upload happens on the sibling reading page.
 */

const PRINT_CSS = `
  * { box-sizing: border-box; }
  html { font-size: 11pt; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.55; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  h1,h2,h3,h4 { color: #0f3d2e; line-height: 1.25; }
  h2 { font-size: 1.5rem; margin: 0 0 .4em; }
  h3 { font-size: 1.15rem; margin: 1.1em 0 .3em; }
  h4 { font-size: 1rem; margin: 1em 0 .2em; color: #12694f; }
  p { margin: .5em 0; }
  a { color: #12694f; text-decoration: none; }
  code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .85em; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; padding: .05em .3em; }
  ul { margin: .4em 0 .8em; padding-left: 1.3em; }
  li { margin: .2em 0; }
  ol.steps { list-style: none; padding-left: 0; counter-reset: step; margin: .5em 0; }
  ol.steps > li { position: relative; padding-left: 1.9em; margin: .4em 0; }
  ol.steps > li::before { counter-increment: step; content: counter(step); position: absolute; left: 0; top: .05em; width: 1.4em; height: 1.4em; background: #12694f; color: #fff; border-radius: 50%; font-size: .72em; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .callout { border-left: 4px solid #12694f; background: #eef6f2; padding: .55em .9em; border-radius: 0 6px 6px 0; margin: .8em 0; break-inside: avoid; }
  .callout.tip { border-color: #3b6fb0; background: #eef3fb; }
  .callout.warn { border-color: #c8912a; background: #fff6e6; }
  .callout .ct { font-weight: 700; font-size: .78em; text-transform: uppercase; letter-spacing: .03em; margin: 0 0 .2em; }
  table { border-collapse: collapse; width: 100%; margin: .8em 0; font-size: .88em; }
  th,td { border: 1px solid #e5e7eb; padding: .4em .6em; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; color: #0f3d2e; }
  tr { break-inside: avoid; }
  figure { margin: 1em 0; break-inside: avoid; }
  figure img { width: 100%; border: 1px solid #e5e7eb; border-radius: 6px; }
  figure .ph { min-height: 90px; border: 1px dashed #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: .85em; }
  figcaption { font-size: .8em; color: #6b7280; margin-top: .3em; }
  figcaption .fc { background: #0f3d2e; color: #fff; border-radius: 4px; padding: .1em .4em; font-family: monospace; font-size: .8em; margin-right: .4em; }
  figcaption .fu { font-family: monospace; color: #12694f; }
  .cover { text-align: center; padding: 26mm 0; break-after: page; }
  .cover .kicker { letter-spacing: .2em; text-transform: uppercase; color: #c8912a; font-weight: 700; font-size: .72rem; }
  .cover h1 { font-size: 2rem; margin: .4em 0 .2em; }
  .cover .bar { height: 5px; width: 84px; margin: 1em auto; background: linear-gradient(90deg,#0f3d2e,#12694f,#c8912a); border-radius: 4px; }
  .cover .sub { color: #6b7280; }
  .cover .meta { margin-top: 2.2em; color: #6b7280; font-size: .9rem; }
  .cover .meta b { color: #1f2937; }
  .toc { break-after: page; }
  .toc h2 { margin-bottom: .6em; }
  .toc ol { list-style: none; padding-left: 0; margin: 0; }
  .toc > ol > li { margin: 5px 0; font-weight: 600; }
  .toc ol ol { padding-left: 14px; font-weight: 400; margin: .2em 0; }
  .toc a { display: flex; justify-content: space-between; gap: 8px; color: #1f2937; border-bottom: 1px dotted #d1d5db; padding: 1px 0; }
  .toc a::after { content: target-counter(attr(href), page); color: #6b7280; }
  .chapter { break-before: page; }
  .chapter > h2 .chip { display: inline-block; background: #0f3d2e; color: #fff; border-radius: 5px; font-size: .68rem; font-weight: 700; padding: .15em .5em; margin-right: .4em; vertical-align: middle; }
  @page { size: A4; margin: 18mm 16mm 15mm;
    @top-right { content: "Manual Admin · PT Duta Firza"; font-size: 8pt; color: #9ca3af; }
    @bottom-center { content: counter(page); font-size: 9pt; color: #6b7280; }
    @bottom-right { content: "zullstack.dev"; font-size: 7.5pt; color: #cbd5e1; }
  }
  @page :first { @top-right { content: ""; } @bottom-center { content: ""; } @bottom-right { content: ""; } }
`;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** **bold**, `code`, [label](#anchor) → HTML (input is escaped first). */
function inlineHtml(text: string): string {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function blockHtml(b: Block, exists: Record<string, boolean>): string {
  switch (b.t) {
    case "h3":
      return `<h3 id="${b.id}">${esc(b.text)}</h3>`;
    case "h4":
      return `<h4>${inlineHtml(b.text)}</h4>`;
    case "lead":
    case "p":
      return `<p>${inlineHtml(b.text)}</p>`;
    case "ul":
      return `<ul>${b.items.map((i) => `<li>${inlineHtml(i)}</li>`).join("")}</ul>`;
    case "steps":
      return `<ol class="steps">${b.items.map((i) => `<li>${inlineHtml(i)}</li>`).join("")}</ol>`;
    case "callout":
      return `<div class="callout ${b.kind}"><p class="ct">${esc(b.title)}</p>${b.body
        .map((line) => `<p>${inlineHtml(line)}</p>`)
        .join("")}</div>`;
    case "table":
      return `<table><thead><tr>${b.head
        .map((h) => `<th>${inlineHtml(h)}</th>`)
        .join("")}</tr></thead><tbody>${b.rows
        .map((r) => `<tr>${r.map((c) => `<td>${inlineHtml(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table>`;
    case "figure": {
      const media = exists[b.code]
        ? `<img src="/api/dev/asset/manual/images/${b.code}.jpg" alt="${esc(b.caption)}">`
        : `<div class="ph">[ ${b.code} ]</div>`;
      const url = b.url ? ` <span class="fu">${esc(b.url)}</span>` : "";
      return `<figure>${media}<figcaption><span class="fc">${b.code}</span>${inlineHtml(b.caption)}${url}</figcaption></figure>`;
    }
    default:
      return "";
  }
}

function bookHtml(book: Book, exists: Record<string, boolean>): string {
  const cover = `<section class="cover"><div class="kicker">Buku Manual Administrator</div><h1>${esc(
    book.title,
  )}</h1><div class="bar"></div><p class="sub">${esc(book.subtitle)}</p><div class="meta"><p>${esc(
    book.langLabel,
  )} · <b>Versi ${esc(book.version)}</b></p><p>Dibuat oleh zullstack.dev</p></div></section>`;

  const tocItems = book.chapters
    .map((ch) => {
      const subs = ch.blocks.filter((b) => b.t === "h3") as Array<{ id: string; text: string }>;
      const subList = subs.length
        ? `<ol>${subs.map((s) => `<li><a href="#${s.id}">${esc(s.text)}</a></li>`).join("")}</ol>`
        : "";
      return `<li><a href="#${ch.id}">${ch.no}. ${esc(ch.title)}</a>${subList}</li>`;
    })
    .join("");
  const toc = `<section class="toc"><h2>Daftar Isi</h2><ol>${tocItems}<li><a href="#lampiran">Lampiran · Daftar Screenshot</a></li></ol></section>`;

  const chapters = book.chapters
    .map(
      (ch) =>
        `<section class="chapter" id="${ch.id}"><h2><span class="chip">Bab ${ch.no}</span>${esc(
          ch.title,
        )}</h2>${ch.blocks.map((b) => blockHtml(b, exists)).join("")}</section>`,
    )
    .join("");

  const rows = book.screenshotChecklist
    .map(
      (r) =>
        `<tr><td>${esc(r.code)}</td><td>${esc(r.location)}</td><td>${esc(r.frame)}</td><td>${esc(
          r.chapter,
        )}</td></tr>`,
    )
    .join("");
  const appendix = `<section class="chapter" id="lampiran"><h2>Lampiran · Daftar Screenshot</h2><table><thead><tr><th>Kode</th><th>Halaman / URL</th><th>Yang di-frame</th><th>Bab</th></tr></thead><tbody>${rows}</tbody></table></section>`;

  return `${cover}${toc}${chapters}${appendix}`;
}

export function PrintBook({ book }: { book: Book }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const targetRef = useRef<HTMLDivElement>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    (async () => {
      try {
        const codes = [
          ...new Set(
            book.chapters.flatMap((c) =>
              c.blocks.filter((b) => b.t === "figure").map((b) => (b as { code: string }).code),
            ),
          ),
        ];
        const exists: Record<string, boolean> = {};
        await Promise.all(
          codes.map(async (code) => {
            try {
              const r = await fetch(`/api/dev/asset/manual/images/${code}.jpg`, {
                method: "HEAD",
                cache: "no-store",
              });
              exists[code] = r.ok;
            } catch {
              exists[code] = false;
            }
          }),
        );

        const html = bookHtml(book, exists);
        await loadPagedPolyfill();
        if (!window.Paged?.Previewer) throw new Error("Paged.js unavailable");
        const cssUrl = URL.createObjectURL(new Blob([PRINT_CSS], { type: "text/css" }));
        const previewer = new window.Paged.Previewer();
        if (targetRef.current) await previewer.preview(html, [cssUrl], targetRef.current);
        URL.revokeObjectURL(cssUrl);
        setStatus("ready");
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    })();
  }, [book]);

  return (
    <div className="min-h-screen bg-neutral-200 dark:bg-neutral-800">
      {/* White page sheets on screen; in print, hide the toolbar and keep a
          clean white page (Paged.js draws the paginated pages). */}
      <style>{`
        .pagedjs_page { background: #ffffff; box-shadow: 0 1px 6px rgba(0,0,0,0.15); margin: 10px auto; }
        @media print {
          .no-print { display: none !important; }
          html, body { background: #ffffff !important; }
          .pagedjs_page { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-2.5">
        <Link
          href={`/devbooks/${book.slug}/${book.lang}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke editor gambar
        </Link>
        <span className="hidden text-xs text-muted-foreground md:inline">
          Saat menyimpan PDF: <b>Margins: Default</b>, <b>matikan “Headers and footers”</b>.
        </span>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={status !== "ready"}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-50"
        >
          <Printer className="h-3.5 w-3.5" /> Simpan sebagai PDF
        </button>
      </div>

      {status === "loading" && (
        <div className="no-print flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan tampilan cetak &amp; nomor
          halaman…
        </div>
      )}
      {status === "error" && (
        <div className="no-print py-24 text-center text-sm text-red-500">
          Gagal menyiapkan tampilan cetak. Muat ulang halaman untuk mencoba lagi.
        </div>
      )}

      <div ref={targetRef} className="pagedjs-render" />
    </div>
  );
}
