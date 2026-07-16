"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateStocksShareholders } from "@/lib/cms/actions";
import { cn } from "@/lib/utils";
import { TABLE_COLUMN_ALIGNS, type TableColumnAlign } from "@/models/constants";

const localized = z.object({ id: z.string(), en: z.string() });
const emptyLocalized = { id: "", en: "" };

const schema = z.object({
  enabled: z.boolean(),
  heading: localized,
  note: localized,
  columns: z.array(
    z.object({
      key: z.string().min(1),
      label: localized,
      align: z.enum(TABLE_COLUMN_ALIGNS),
    }),
  ),
  rows: z.array(
    z.object({
      cells: z.array(z.object({ columnKey: z.string().min(1), value: localized })),
      emphasis: z.boolean(),
    }),
  ),
});

export type ShareholdersFormValues = z.infer<typeof schema>;

/** Next free `colN` key. Keys are permanent — cells address their column by it. */
function nextColumnKey(columns: { key: string }[]): string {
  const used = new Set(columns.map((c) => c.key));
  let n = columns.length + 1;
  while (used.has(`col${n}`)) n += 1;
  return `col${n}`;
}

interface Props {
  initial: ShareholdersFormValues;
}

/**
 * Shareholder-composition table editor for /admin/investor-relations/stocks.
 *
 * Columns are editor-defined, so every row is kept holding exactly one cell per
 * column, in column order — that lets the cell inputs register at a plain
 * `rows.i.cells.j` path while each cell still records its `columnKey` for the
 * public renderer to look up. Every column mutation below therefore has to make
 * the matching edit across all rows to preserve that invariant.
 */
export function ShareholdersForm({ initial }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const enabledId = useId();
  const [cellLocale, setCellLocale] = useState<"id" | "en">("id");

  const form = useForm<ShareholdersFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = form;

  const {
    fields: columnFields,
    append: appendColumn,
    remove: removeColumnField,
    move: moveColumn,
  } = useFieldArray({ control, name: "columns" });
  const {
    fields: rowFields,
    append: appendRow,
    remove: removeRow,
    move: moveRow,
    replace: replaceRows,
  } = useFieldArray({ control, name: "rows" });

  const enabled = watch("enabled");

  const addColumn = () => {
    const key = nextColumnKey(getValues("columns"));
    appendColumn({ key, label: emptyLocalized, align: "left" });
    replaceRows(
      getValues("rows").map((row) => ({
        ...row,
        cells: [...row.cells, { columnKey: key, value: emptyLocalized }],
      })),
    );
  };

  const removeColumn = (index: number) => {
    const key = getValues(`columns.${index}.key`);
    removeColumnField(index);
    replaceRows(
      getValues("rows").map((row) => ({
        ...row,
        cells: row.cells.filter((cell) => cell.columnKey !== key),
      })),
    );
  };

  const shiftColumnUp = (index: number) => {
    moveColumn(index, index - 1);
    replaceRows(
      getValues("rows").map((row) => {
        const cells = [...row.cells];
        const [moved] = cells.splice(index, 1);
        cells.splice(index - 1, 0, moved);
        return { ...row, cells };
      }),
    );
  };

  const addRow = () => {
    appendRow({
      cells: getValues("columns").map((c) => ({ columnKey: c.key, value: emptyLocalized })),
      emphasis: false,
    });
  };

  const onSubmit = async (values: ShareholdersFormValues) => {
    const result = await updateStocksShareholders(values);
    if (result.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("groups.shareholdersTable")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                id={enabledId}
                checked={enabled}
                onCheckedChange={(v) => setValue("enabled", v, { shouldDirty: true })}
              />
              <Label htmlFor={enabledId}>{t("fields.shareholdersEnabled")}</Label>
            </div>
            <LocalizedField
              label={`${t("fields.shareholdersHeading")} (${t("optional")})`}
              name="heading"
              form={form}
            />
            <LocalizedField
              label={`${t("fields.shareholdersNote")} (${t("optional")})`}
              name="note"
              form={form}
              multiline
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {t("shareholders.columns")} · {columnFields.length}
            </CardTitle>
            <Button type="button" size="sm" onClick={addColumn}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t("shareholders.addColumn")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {columnFields.length === 0 && (
              <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                {t("shareholders.emptyColumns")}
              </p>
            )}
            {columnFields.map((column, index) => (
              <div key={column.id} className="flex items-start gap-2 rounded-md border bg-card p-3">
                <button
                  type="button"
                  onClick={() => index > 0 && shiftColumnUp(index)}
                  disabled={index === 0}
                  className="mt-7 shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title={t("shareholders.moveUp")}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>
                <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_1fr_10rem]">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t("shareholders.columnLabel")} — ID
                    </Label>
                    <Input {...register(`columns.${index}.label.id`)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t("shareholders.columnLabel")} — EN
                    </Label>
                    <Input {...register(`columns.${index}.label.en`)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t("shareholders.columnAlign")}
                    </Label>
                    <Select
                      value={watch(`columns.${index}.align`)}
                      onValueChange={(v) =>
                        setValue(`columns.${index}.align`, v as TableColumnAlign, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TABLE_COLUMN_ALIGNS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {t(`shareholders.align.${a}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeColumn(index)}
                  className="mt-7 shrink-0 text-muted-foreground hover:text-destructive"
                  title={t("shareholders.removeColumn")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {t("shareholders.rows")} · {rowFields.length}
            </CardTitle>
            <Button type="button" size="sm" onClick={addRow} disabled={columnFields.length === 0}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t("shareholders.addRow")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">{t("shareholders.cellLocale")}</span>
              <div className="inline-flex rounded-md border bg-card p-0.5">
                {(["id", "en"] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setCellLocale(loc)}
                    aria-pressed={cellLocale === loc}
                    className={cn(
                      "rounded px-3 py-1 text-xs font-medium uppercase transition-colors",
                      cellLocale === loc
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              {cellLocale === "en" && (
                <p className="text-xs text-muted-foreground">{t("shareholders.enFallbackHint")}</p>
              )}
            </div>

            {columnFields.length === 0 ? (
              <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                {t("shareholders.columnsFirst")}
              </p>
            ) : (
              rowFields.length === 0 && (
                <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                  {t("shareholders.emptyRows")}
                </p>
              )
            )}

            {rowFields.map((row, rowIndex) => (
              <div key={row.id} className="space-y-3 rounded-md border bg-card p-3">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => rowIndex > 0 && moveRow(rowIndex, rowIndex - 1)}
                    disabled={rowIndex === 0}
                    className="mt-7 shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title={t("shareholders.moveUp")}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                  <div
                    className="grid flex-1 gap-3"
                    style={{
                      gridTemplateColumns: `repeat(${columnFields.length}, minmax(8rem, 1fr))`,
                    }}
                  >
                    {columnFields.map((column, colIndex) => (
                      <div key={column.id} className="space-y-1.5">
                        <Label className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
                          {watch(`columns.${colIndex}.label.${cellLocale}`) ||
                            watch(`columns.${colIndex}.label.id`) ||
                            t("shareholders.untitledColumn")}
                        </Label>
                        <Input
                          {...register(`rows.${rowIndex}.cells.${colIndex}.value.${cellLocale}`)}
                          placeholder={
                            cellLocale === "en"
                              ? watch(`rows.${rowIndex}.cells.${colIndex}.value.id`)
                              : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="mt-7 shrink-0 text-muted-foreground hover:text-destructive"
                    title={t("shareholders.removeRow")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 pl-6">
                  <Switch
                    id={`sh-emphasis-${row.id}`}
                    checked={watch(`rows.${rowIndex}.emphasis`)}
                    onCheckedChange={(v) =>
                      setValue(`rows.${rowIndex}.emphasis`, v, { shouldDirty: true })
                    }
                  />
                  <Label htmlFor={`sh-emphasis-${row.id}`} className="text-xs font-normal">
                    {t("shareholders.emphasis")}
                  </Label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <StickyFormBar>
        <Button type="submit" variant="brand" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </StickyFormBar>
    </form>
  );
}
