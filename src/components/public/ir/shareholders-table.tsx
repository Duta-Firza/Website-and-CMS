import { cn } from "@/lib/utils";
import type { ShareholdersTableData } from "@/lib/cms/investor-relations";

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

interface Props {
  data: ShareholdersTableData;
  /** Used when the editor left the CMS heading blank. */
  fallbackHeading: string;
}

/**
 * Shareholder-composition table for the public stocks page.
 *
 * Deliberately not built on `@/components/ui/table`: that one is a client
 * component and pins every cell to `whitespace-nowrap`, which suits admin's
 * short values but would keep long shareholder names from wrapping here.
 */
export function ShareholdersTable({ data, fallbackHeading }: Props) {
  const { heading, note, columns, rows } = data;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
        {heading || fallbackHeading}
      </h2>
      {/* Columns are editor-defined, so the table can outgrow the viewport —
          it scrolls inside this wrapper rather than the page scrolling. */}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full caption-bottom border-collapse text-sm">
          <thead className="bg-muted/30">
            <tr className="border-b">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-semibold text-brand-deep dark:text-foreground",
                    ALIGN_CLASS[col.align],
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                // Rows carry no stable id of their own and are free-form text,
                // so their order is the only thing identifying them.
                // biome-ignore lint/suspicious/noArrayIndexKey: no stable row identity in CMS data
                key={i}
                className={cn(
                  "border-b last:border-b-0",
                  row.emphasis && "border-t border-t-border bg-muted/20 font-semibold",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3",
                      // Set on the cell, not the row: a colour on <tr> is only
                      // inherited, and the cell's own class would override it.
                      row.emphasis
                        ? "text-brand-deep dark:text-foreground"
                        : "text-muted-foreground",
                      ALIGN_CLASS[col.align],
                    )}
                  >
                    {row.cells[col.key] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>}
    </section>
  );
}
