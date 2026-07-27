import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import type { Book } from "@/content/devbooks/types";
import { BlockList } from "./book-content";

const CREDIT = "Dibuat oleh zullstack.dev";

/** Sub-sections (h3 blocks) inside a chapter, for the table of contents. */
function chapterSubsections(book: Book) {
  return book.chapters.map((ch) => ({
    ...ch,
    subs: ch.blocks.filter((b): b is Extract<typeof b, { t: "h3" }> => b.t === "h3"),
  }));
}

export function BookShell({ book }: { book: Book }) {
  const chapters = chapterSubsections(book);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Print layout: cover + TOC as their own pages, chapters page-break,
          running header (version) + footer (credit) on every printed page. */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .book-cover { break-after: page; }
          .book-toc { break-after: page; }
          .book-chapter { break-before: page; }
          h2, h3, h4 { break-after: avoid; }
          figure, table tr { break-inside: avoid; }
          @page { size: A4; margin: 16mm 14mm; }
        }
      `}</style>

      {/* Screen-only toolbar (kept out of the PDF; reveals nothing about /dev) */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/devbooks"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Unggah screenshot di kotak masing-masing, lalu buat PDF.
          </span>
          <Link
            href={`/devbooks/${book.slug}/${book.lang}/print`}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-deep"
          >
            <Printer className="h-3.5 w-3.5" /> Buat PDF (dengan nomor halaman)
          </Link>
        </div>
      </div>

      {/* Cover */}
      <section className="book-cover flex min-h-[70vh] flex-col items-center justify-center border-b border-border py-16 text-center print:min-h-0 print:border-0">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">
          Buku Manual Administrator
        </p>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-brand-deep dark:text-foreground">
          {book.title}
        </h1>
        <div className="my-5 h-1.5 w-24 rounded bg-linear-to-r from-brand-deep via-brand-primary to-brand-accent" />
        <p className="max-w-md text-muted-foreground">{book.subtitle}</p>
        <div className="mt-10 space-y-1 text-sm text-muted-foreground">
          <p>
            {book.langLabel} · <span className="font-medium text-foreground">{book.version}</span>
          </p>
          <p>{CREDIT}</p>
        </div>
      </section>

      {/* Table of contents (clickable — preserved as links in the PDF) */}
      <section className="book-toc py-8">
        <h2 className="mb-4 text-xl font-bold text-brand-deep dark:text-foreground">Daftar Isi</h2>
        <ol className="space-y-2 text-sm">
          {chapters.map((ch) => (
            <li key={ch.id}>
              <a
                href={`#${ch.id}`}
                className="font-medium text-foreground hover:text-brand-primary"
              >
                {ch.no}. {ch.title}
              </a>
              {ch.subs.length > 0 && (
                <ul className="mt-1 space-y-1 pl-5">
                  {ch.subs.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-muted-foreground hover:text-brand-primary"
                      >
                        {s.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          <li>
            <a href="#lampiran" className="font-medium text-foreground hover:text-brand-primary">
              Lampiran · Daftar Screenshot
            </a>
          </li>
        </ol>
      </section>

      {/* Chapters */}
      {book.chapters.map((ch) => (
        <section key={ch.id} id={ch.id} className="book-chapter scroll-mt-20">
          <h2 className="mt-2 flex items-center gap-2 text-xl font-bold text-brand-deep dark:text-foreground">
            <span className="rounded-md bg-brand-deep px-2 py-0.5 text-xs font-bold text-white dark:bg-brand-primary">
              Bab {ch.no}
            </span>
            {ch.title}
          </h2>
          <BlockList blocks={ch.blocks} />
        </section>
      ))}

      {/* Appendix: screenshot checklist */}
      <section id="lampiran" className="book-chapter scroll-mt-20">
        <h2 className="mt-2 text-xl font-bold text-brand-deep dark:text-foreground">
          Lampiran · Daftar Screenshot
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {["Kode", "Halaman / URL", "Yang di-frame", "Bab"].map((h) => (
                  <th
                    key={h}
                    className="border border-border bg-muted px-3 py-2 text-left font-semibold text-brand-deep dark:text-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {book.screenshotChecklist.map((r) => (
                <tr key={r.code} className="break-inside-avoid">
                  <td className="border border-border px-3 py-2 font-mono text-xs">{r.code}</td>
                  <td className="border border-border px-3 py-2 font-mono text-xs text-brand-primary">
                    {r.location}
                  </td>
                  <td className="border border-border px-3 py-2 text-foreground/90">{r.frame}</td>
                  <td className="border border-border px-3 py-2 text-foreground/90">{r.chapter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
