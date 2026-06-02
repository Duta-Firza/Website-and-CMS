"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteStat, upsertStat } from "@/lib/cms/actions";
import { STAT_ICONS, type StatIcon } from "@/models/constants";

interface StatRow {
  id: string;
  label: { id: string; en: string };
  prefix: string;
  value: number;
  suffix: string;
  order: number;
  iconName: StatIcon;
}

const schema = z.object({
  id: z.string().optional(),
  label: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  prefix: z.string(),
  value: z.number(),
  suffix: z.string(),
  order: z.number().int(),
  iconName: z.enum(STAT_ICONS),
});

type FormValues = z.infer<typeof schema>;
const empty: FormValues = {
  label: { id: "", en: "" },
  prefix: "",
  value: 0,
  suffix: "",
  order: 0,
  iconName: "ChartBar",
};

export function StatsManager({ initial }: { initial: StatRow[] }) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing(empty)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {initial.map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-2 pt-6">
              <p className="text-4xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
                {s.prefix}
                {s.value.toLocaleString()}
                {s.suffix}
              </p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label.id}</p>
              <div className="flex justify-end gap-1 pt-2">
                <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ ...s })}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(s.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {initial.length === 0 && (
          <div className="col-span-full rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No stats yet.
          </div>
        )}
      </div>

      {editing && (
        <StatDialog
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async () => {
                if (!deleteId) return;
                const result = await deleteStat(deleteId);
                if (result.ok) {
                  toast.success(t("saved"));
                  setDeleteId(null);
                  router.refresh();
                } else toast.error(result.error);
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StatDialog({
  initial,
  onClose,
  onSaved,
}: {
  initial: FormValues;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("Admin");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await upsertStat(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else toast.error(result.error);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial.id ? t("edit") : t("add")} Stat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <LocalizedField label="Label" name="label" form={form} />
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="s-prefix">Prefix</Label>
              <Input id="s-prefix" {...register("prefix")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-value">Value</Label>
              <Input id="s-value" type="number" {...register("value", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-suffix">Suffix</Label>
              <Input id="s-suffix" {...register("suffix")} placeholder="+" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="s-order">Order</Label>
              <Input id="s-order" type="number" {...register("order", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={watch("iconName")}
                onValueChange={(v) => setValue("iconName", v as StatIcon, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAT_ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
