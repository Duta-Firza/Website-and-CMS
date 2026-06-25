"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSolutionsLayout } from "@/lib/cms/actions";
import { SolutionForm } from "./solution-card-form";

export interface SolutionRow {
  id?: string;
  key: string;
  title: { id: string; en: string };
  description: { id: string; en: string };
  iconName: string;
  href: string;
  order: number;
  isActive: boolean;
}

const emptyNew = (order: number): SolutionRow => ({
  key: "",
  title: { id: "", en: "" },
  description: { id: "", en: "" },
  iconName: "Box",
  href: "/solutions/",
  order,
  isActive: true,
});

export function SolutionsManager({
  initial,
  initialColumns,
}: {
  initial: SolutionRow[];
  initialColumns: number;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [items, setItems] = useState<SolutionRow[]>(initial);
  const [pendingNew, setPendingNew] = useState<SolutionRow[]>([]);
  const [columns, setColumns] = useState(initialColumns);
  const [savingColumns, setSavingColumns] = useState(false);

  const handleColumnsChange = async (val: string | null) => {
    if (!val) return;
    const n = parseInt(val, 10);
    const prev = columns;
    setColumns(n);
    setSavingColumns(true);
    const result = await updateSolutionsLayout({ columnsPerRow: n });
    setSavingColumns(false);
    if (!result.ok) {
      toast.error(result.error);
      setColumns(prev);
    } else {
      toast.success(t("saved"));
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Columns per row setting */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <Label htmlFor="cols-select" className="shrink-0 text-sm font-medium">
            {t("fields.solutionsColumnsPerRow")}
          </Label>
          <Select
            value={String(columns)}
            onValueChange={handleColumnsChange}
            disabled={savingColumns}
          >
            <SelectTrigger id="cols-select" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 kolom</SelectItem>
              <SelectItem value="3">3 kolom</SelectItem>
              <SelectItem value="4">4 kolom</SelectItem>
            </SelectContent>
          </Select>
          {savingColumns && (
            <span className="text-xs text-muted-foreground">{t("saving")}</span>
          )}
        </CardContent>
      </Card>

      {/* Solution cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {items.map((s) => (
          <SolutionForm
            key={s.id ?? s.key}
            initial={s}
            isNew={false}
            onDeleted={() => {
              setItems((prev) => prev.filter((x) => x.id !== s.id));
              router.refresh();
            }}
            onSaved={() => router.refresh()}
          />
        ))}
        {pendingNew.map((s, i) => (
          <SolutionForm
            key={`new-${i}`}
            initial={s}
            isNew
            onDeleted={() => setPendingNew((prev) => prev.filter((_, idx) => idx !== i))}
            onSaved={() => {
              setPendingNew((prev) => prev.filter((_, idx) => idx !== i));
              router.refresh();
            }}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setPendingNew((prev) => [...prev, emptyNew(items.length + pendingNew.length)])
        }
      >
        <Plus className="mr-2 h-4 w-4" />
        {t("add")}
      </Button>
    </div>
  );
}
