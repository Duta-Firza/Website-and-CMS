import { connectDB } from "@/lib/db";
import { IrSubPage, type TableColumnAlign } from "@/models";
import type { ShareholdersFormValues } from "./shareholders-form";

const EMPTY_LOCALIZED = { id: "", en: "" };

const DEFAULT_FORM_VALUES: ShareholdersFormValues = {
  enabled: false,
  heading: EMPTY_LOCALIZED,
  note: EMPTY_LOCALIZED,
  columns: [],
  rows: [],
};

interface ShareholdersDoc {
  enabled?: boolean;
  heading?: { id?: string; en?: string };
  note?: { id?: string; en?: string };
  columns?: { key: string; label?: { id?: string; en?: string }; align?: TableColumnAlign }[];
  rows?: {
    cells?: { columnKey: string; value?: { id?: string; en?: string } }[];
    emphasis?: boolean;
    order?: number;
  }[];
}

export async function loadStocksShareholders(): Promise<ShareholdersFormValues> {
  await connectDB();
  const doc = await IrSubPage.findById("stocks")
    .select("shareholders")
    .lean<{ shareholders?: ShareholdersDoc } | null>();

  const raw = doc?.shareholders;
  if (!raw) return DEFAULT_FORM_VALUES;

  return {
    enabled: raw.enabled ?? false,
    heading: { id: raw.heading?.id ?? "", en: raw.heading?.en ?? "" },
    note: { id: raw.note?.id ?? "", en: raw.note?.en ?? "" },
    columns: (raw.columns ?? []).map((c) => ({
      key: c.key,
      label: { id: c.label?.id ?? "", en: c.label?.en ?? "" },
      align: c.align ?? "left",
    })),
    rows: [...(raw.rows ?? [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((r) => ({
        cells: (r.cells ?? []).map((cell) => ({
          columnKey: cell.columnKey,
          value: { id: cell.value?.id ?? "", en: cell.value?.en ?? "" },
        })),
        emphasis: Boolean(r.emphasis),
      })),
  };
}
