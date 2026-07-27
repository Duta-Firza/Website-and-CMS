import { manualId } from "./manual-id";
import type { Book } from "./types";

export interface BookEntry {
  slug: string;
  title: string;
  description: string;
  /** Languages available now; others render a "coming soon" notice. */
  langs: Array<{ lang: "id" | "en"; label: string; available: boolean }>;
  status: "available" | "soon";
  book?: Record<string, Book>;
}

/** Documentation catalogue shown on /devbooks. Add new books here. */
export const BOOKS: BookEntry[] = [
  {
    slug: "manual",
    title: "Manual Book Admin",
    description: "Panduan lengkap pemakaian CMS / dashboard admin untuk mengelola konten & data.",
    langs: [
      { lang: "id", label: "Bahasa Indonesia", available: true },
      { lang: "en", label: "English", available: false },
    ],
    status: "available",
    book: { id: manualId },
  },
  {
    slug: "api",
    title: "API Documentation",
    description: "Referensi endpoint & integrasi (menyusul).",
    langs: [{ lang: "en", label: "English", available: false }],
    status: "soon",
  },
];

export function getBook(slug: string, lang: string): Book | null {
  const entry = BOOKS.find((b) => b.slug === slug);
  return entry?.book?.[lang] ?? null;
}
