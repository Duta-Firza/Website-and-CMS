import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Book } from "@/content/devbooks/types";
import { PrintButton } from "./book-client";
import { BlockList } from "./book-content";

/** Sub-sections (h3 blocks) inside a chapter, for the TOC. */
function chapterSubsections(book: Book) {
  return book.chapters.map((ch) => ({
    ...ch,
    subs: ch.blocks.filter((b): b is Extract<typeof b, { t: "h3" }> => b.t === "h3"),
  }));
}

export function BookShell({ book }: { book: Book }) {
  const chapters = chapterSubsections(book);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Print rules: hide app chrome + TOC, tidy page breaks for PDF export. */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .book-main { max-width: none !important; }
          .book-chapter { break-before: page; }
          .book-chapter:first-of-type { break-before: auto; }
          h2, h3, h4 { break-after: avoid; }
          @page { size: A4; margin: 16mm 14mm; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <Link
            href="/devbooks"
            className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Semua buku
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-brand-deep dark:text-foreground">
            {book.title}
          </h1>
          <p className="text-sm text-muted-foreground">{book.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
            {book.langLabel} · {book.version}
          </span>
          <PrintButton />
        </div>
      </div>

      <div className="gap-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* TOC */}
        <aside className="no-print hidden lg:block">
          <nav className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pb-8 text-sm">
            <p className="mb-2 font-semibold text-foreground">Daftar Isi</p>
            <ol className="space-y-2">
              {chapters.map((ch) => (
                <li key={ch.id}>
                  <a
                    href={`#${ch.id}`}
                    className="font-medium text-foreground hover:text-brand-primary"
                  >
                    {ch.no}. {ch.title}
                  </a>
                  {ch.subs.length > 0 && (
                    <ul className="mt-1 space-y-1 border-l border-border pl-3">
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
                <a
                  href="#lampiran"
                  className="font-medium text-foreground hover:text-brand-primary"
                >
                  Lampiran · Checklist Screenshot
                </a>
              </li>
            </ol>
          </nav>
        </aside>

        {/* Content */}
        <main className="book-main min-w-0 max-w-3xl">
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
              Lampiran · Daftar Screenshot (Checklist)
            </h2>
            <p className="mt-3 leading-relaxed text-foreground/90">
              Ambil screenshot berikut lalu simpan sebagai{" "}
              <code className="rounded border border-border bg-muted px-1 font-mono text-[0.85em]">
                content/devbooks/manual/images/&lt;kode&gt;.jpg
              </code>{" "}
              dan commit — gambar akan otomatis muncul di buku ini. Ambil dalam bahasa Indonesia
              (URL{" "}
              <code className="rounded border border-border bg-muted px-1 font-mono text-[0.85em]">
                /id/…
              </code>
              ).
            </p>
            <div className="my-4 overflow-x-auto">
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
                      <td className="border border-border px-3 py-2 text-foreground/90">
                        {r.frame}
                      </td>
                      <td className="border border-border px-3 py-2 text-foreground/90">
                        {r.chapter}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
