/**
 * Data model for Dev Books (native, framework-agnostic content).
 *
 * Content is authored as plain data so the same structure can carry any
 * language (ID now, EN later) and be rendered by one component tree. Inline
 * emphasis uses a tiny markup: `**bold**` and `` `code` `` (see rich.tsx).
 */

export type Block =
  | { t: "h3"; id: string; text: string }
  | { t: "h4"; text: string }
  | { t: "lead"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "steps"; items: string[] }
  | { t: "callout"; kind: "note" | "warn" | "tip"; title: string; body: string[] }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "figure"; code: string; caption: string; url?: string };

export interface Chapter {
  /** e.g. "1", "2" — shown in the chip and TOC. */
  no: string;
  /** anchor id, e.g. "bab1". */
  id: string;
  title: string;
  blocks: Block[];
}

export interface ScreenshotRow {
  code: string;
  location: string;
  frame: string;
  chapter: string;
}

export interface Book {
  slug: string;
  lang: "id" | "en";
  langLabel: string;
  title: string;
  /** Cover line 1 (small caps eyebrow). */
  coverKicker: string;
  /** Cover line 2 (large title). */
  coverTitle: string;
  subtitle: string;
  version: string;
  year: string;
  chapters: Chapter[];
  /** Appendix checklist rows. */
  screenshotChecklist: ScreenshotRow[];
}
