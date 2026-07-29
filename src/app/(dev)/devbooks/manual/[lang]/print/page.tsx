import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PrintBook } from "@/components/devbooks/print-book";
import { getBook } from "@/content/devbooks/registry";
import { assertDevSession } from "@/lib/devtools/dev-session";

export const dynamic = "force-dynamic";

export default async function ManualPrintPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  await assertDevSession(`/devbooks/manual/${lang}/print`);

  const book = getBook("manual", lang);
  if (!book) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Belum tersedia</h1>
        <Link
          href="/devbooks"
          className="mt-6 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke daftar buku
        </Link>
      </main>
    );
  }

  return <PrintBook book={book} />;
}
