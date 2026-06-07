"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DragHandle, SortableContainer, SortableItem } from "@/components/admin/sortable-list";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteReachPoint, reorderReachPoints, upsertReachPoint } from "@/lib/cms/actions";

interface ReachRow {
  id: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  order: number;
}

const schema = z.object({
  id: z.string().optional(),
  city: z.string().min(1),
  province: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;
const empty: FormValues = { city: "", province: "", latitude: 0, longitude: 0, order: 0 };

export function ReachManager({ initial }: { initial: ReachRow[] }) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [items, setItems] = useState(initial);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const handleReorder = async (newIds: string[]) => {
    const next = newIds
      .map((id) => items.find((r) => r.id === id))
      .filter((r): r is ReachRow => !!r);
    setItems(next);
    const result = await reorderReachPoints(newIds);
    if (!result.ok) {
      toast.error(result.error);
      setItems(initial);
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <MapPin className="mr-1 inline h-3.5 w-3.5" />
          {t("helpers.reachIntro", { count: items.length })}
        </p>
        <Button onClick={() => setEditing({ ...empty, order: items.length + 1 })}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>{t("common.city")}</TableHead>
              <TableHead>{t("common.province")}</TableHead>
              <TableHead className="hidden md:table-cell">Lat, Lng</TableHead>
              <TableHead className="w-24 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContainer items={items.map((r) => r.id)} onReorder={handleReorder}>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    {t("empty.pinpoints")}
                  </TableCell>
                </TableRow>
              )}
              {items.map((r) => (
                <SortableItem key={r.id} id={r.id}>
                  {({ ref, style, handleProps }) => (
                    <TableRow ref={ref} style={style}>
                      <TableCell>
                        <DragHandle handleProps={handleProps} size="sm" />
                      </TableCell>
                      <TableCell className="font-medium">{r.city}</TableCell>
                      <TableCell>{r.province}</TableCell>
                      <TableCell className="hidden font-mono text-xs md:table-cell">
                        {r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditing({ ...r })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(r.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </SortableItem>
              ))}
            </TableBody>
          </SortableContainer>
        </Table>
      </div>

      {editing && (
        <ReachDialog
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
                const result = await deleteReachPoint(deleteId);
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

function ReachDialog({
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
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await upsertReachPoint(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else toast.error(result.error);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial.id ? t("edit") : t("add")} {t("nouns.pinpoint")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="r-city">{t("common.city")}</Label>
              <Input id="r-city" {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-province">{t("common.province")}</Label>
              <Input id="r-province" {...register("province")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-lat">{t("fields.latitude")}</Label>
              <Input
                id="r-lat"
                type="number"
                step="0.0001"
                {...register("latitude", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-lng">{t("fields.longitude")}</Label>
              <Input
                id="r-lng"
                type="number"
                step="0.0001"
                {...register("longitude", { valueAsNumber: true })}
              />
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
