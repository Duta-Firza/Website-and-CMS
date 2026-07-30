import { ArrowRight, BookText, FileCode2 } from "lucide-react";
import Link from "next/link";
import { ManualPublish } from "@/components/devbooks/manual-publish";
import { BOOKS } from "@/content/devbooks/registry";
import { getManualBookUrls } from "@/lib/cms/site-settings";
import { assertDevSession } from "@/lib/devtools/dev-session";

export const dynamic = "force-dynamic";

const ICONS: Record<string, typeof BookText> = { manual: BookText, api: FileCode2 };

export default async function DevBooksPage() {
  await assertDevSession("/devbooks");
  const published = await getManualBookUrls().catch(() => ({ id: "", en: "" }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-brand-deep dark:text-foreground">
          Dev Books
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hub dokumentasi internal — manual book, dokumentasi API, dan lainnya.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {BOOKS.map((entry) => {
          const Icon = ICONS[entry.slug] ?? BookText;
          const soon = entry.status === "soon";
          return (
            <div
              key={entry.slug}
              className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="text-base font-semibold text-foreground">{entry.title}</h2>
                {soon && (
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Segera
                  </span>
                )}
              </div>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">{entry.description}</p>
              <div className="flex flex-wrap gap-2">
                {entry.langs.map((l) =>
                  l.available ? (
                    <Link
                      key={l.lang}
                      href={`/devbooks/${entry.slug}/${l.lang}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-deep"
                    >
                      {l.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span
                      key={l.lang}
                      className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground"
                    >
                      {l.label} · segera
                    </span>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ManualPublish initialId={published.id} initialEn={published.en} />
    </main>
  );
}
