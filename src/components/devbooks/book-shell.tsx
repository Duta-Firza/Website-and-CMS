import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { bookLabels } from "@/content/devbooks/labels";
import type { Book } from "@/content/devbooks/types";
import { BlockList } from "./book-content";

/** Sub-sections (h3 blocks) inside a chapter, for the table of contents. */
function chapterSubsections(book: Book) {
  return book.chapters.map((ch) => ({
    ...ch,
    subs: ch.blocks.filter((b): b is Extract<typeof b, { t: "h3" }> => b.t === "h3"),
  }));
}

export function BookShell({ book }: { book: Book }) {
  const chapters = chapterSubsections(book);
  const L = bookLabels(book.lang);

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
          <ArrowLeft className="h-3.5 w-3.5" /> {L.back}
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">{L.uploadHint}</span>
          <Link
            href={`/devbooks/${book.slug}/${book.lang}/print`}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-deep"
          >
            <Printer className="h-3.5 w-3.5" /> {L.makePdf}
          </Link>
        </div>
      </div>

      {/* Cover */}
      <section className="book-cover flex min-h-[70vh] flex-col items-center justify-center border-b border-border py-16 text-center print:min-h-0 print:border-0">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">
          {book.coverKicker}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-brand-deep dark:text-foreground">
          {book.coverTitle}
        </h1>
        <div className="my-5 h-1.5 w-56 max-w-[70%] rounded bg-linear-to-r from-brand-deep via-brand-primary to-brand-accent" />
        <p className="max-w-md text-muted-foreground">{book.subtitle}</p>
        <div className="mt-10 space-y-1 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">
              {book.langLabel} · {L.versionWord} {book.version}
            </span>
          </p>
          <p>{L.credit}</p>
          <p>{book.year}</p>
        </div>
      </section>

      {/* Table of contents (clickable — preserved as links in the PDF) */}
      <section className="book-toc py-8">
        <h2 className="mb-4 text-xl font-bold text-brand-deep dark:text-foreground">{L.toc}</h2>
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
              {L.appendix}
            </a>
          </li>
        </ol>
      </section>

      {/* Chapters */}
      {book.chapters.map((ch) => (
        <section key={ch.id} id={ch.id} className="book-chapter scroll-mt-20">
          <h2 className="mt-2 flex items-center gap-2 text-xl font-bold text-brand-deep dark:text-foreground">
            <span className="rounded-md bg-brand-deep px-2 py-0.5 text-xs font-bold text-white dark:bg-brand-primary">
              {L.chapter} {ch.no}
            </span>
            {ch.title}
          </h2>
          <BlockList blocks={ch.blocks} />
        </section>
      ))}

      {/* Appendix: screenshot checklist */}
      <section id="lampiran" className="book-chapter scroll-mt-20">
        <h2 className="mt-2 text-xl font-bold text-brand-deep dark:text-foreground">
          {L.appendix}
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {[L.cols.code, L.cols.page, L.cols.frame, L.cols.chapter].map((h) => (
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
