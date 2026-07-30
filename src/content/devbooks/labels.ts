/** UI/structural labels for the book renderer, per language. Content itself
 *  lives in each book's data (manual-id.ts / manual-en.ts); these are the
 *  chrome strings (TOC heading, "Chapter", appendix, toolbar, print view). */

export interface BookLabels {
  back: string;
  uploadHint: string;
  makePdf: string;
  toc: string;
  chapter: string;
  appendix: string;
  cols: { code: string; page: string; frame: string; chapter: string };
  runningHeader: string;
  versionWord: string;
  credit: string;
  print: {
    back: string;
    instruction: string;
    save: string;
    preparing: string;
    failed: string;
  };
}

const ID: BookLabels = {
  back: "Kembali",
  uploadHint: "Unggah screenshot di kotak masing-masing, lalu buat PDF.",
  makePdf: "Buat PDF (dengan nomor halaman)",
  toc: "Daftar Isi",
  chapter: "Bab",
  appendix: "Lampiran · Daftar Screenshot",
  cols: { code: "Kode", page: "Halaman / URL", frame: "Yang di-frame", chapter: "Bab" },
  runningHeader: "Manual Admin · PT Duta Firza",
  versionWord: "Versi",
  credit: "Dibuat oleh zullstack.dev",
  print: {
    back: "Kembali ke editor gambar",
    instruction: "Saat menyimpan PDF: Margins: Default, matikan “Headers and footers”.",
    save: "Simpan sebagai PDF",
    preparing: "Menyiapkan tampilan cetak & nomor halaman…",
    failed: "Gagal menyiapkan tampilan cetak. Muat ulang halaman untuk mencoba lagi.",
  },
};

const EN: BookLabels = {
  back: "Back",
  uploadHint: "Upload screenshots into each box, then build the PDF.",
  makePdf: "Build PDF (with page numbers)",
  toc: "Table of Contents",
  chapter: "Chapter",
  appendix: "Appendix · Screenshot List",
  cols: { code: "Code", page: "Page / URL", frame: "What to frame", chapter: "Chapter" },
  runningHeader: "Admin Manual · PT Duta Firza",
  versionWord: "Version",
  credit: "Made by zullstack.dev",
  print: {
    back: "Back to image editor",
    instruction: "When saving as PDF: Margins: Default, turn off “Headers and footers”.",
    save: "Save as PDF",
    preparing: "Preparing print view & page numbers…",
    failed: "Failed to prepare the print view. Reload the page to try again.",
  },
};

export function bookLabels(lang: "id" | "en"): BookLabels {
  return lang === "en" ? EN : ID;
}
