"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImagePreview } from "@/components/admin/image-preview";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCustomer, reorderCustomers, upsertCustomer } from "@/lib/cms/actions";
import type { CustomerRow } from "./page";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  logoUrl: z.string().min(1),
  order: z.number().int(),
  invertOnDark: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
const empty: FormValues = { name: "", logoUrl: "", order: 0, invertOnDark: false };

export function CustomersManager({ initial }: { initial: CustomerRow[] }) {
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
      .map((id) => items.find((c) => c.id === id))
      .filter((c): c is CustomerRow => !!c);
    setItems(next);
    const result = await reorderCustomers(newIds);
    if (!result.ok) {
      toast.error(result.error);
      setItems(initial);
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex justify-end">
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
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContainer items={items.map((c) => c.id)} onReorder={handleReorder}>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No customers yet.
                  </TableCell>
                </TableRow>
              )}
              {items.map((c) => (
                <SortableItem key={c.id} id={c.id}>
                  {({ ref, style, handleProps }) => (
                    <TableRow ref={ref} style={style}>
                      <TableCell>
                        <DragHandle handleProps={handleProps} size="sm" />
                      </TableCell>
                      <TableCell>
                        <ImagePreview src={c.logoUrl} alt={c.name} invertOnDark={c.invertOnDark} />
                      </TableCell>
                      <TableCell className="max-w-xs font-medium">
                        <span className="block truncate" title={c.name}>
                          {c.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditing({ ...c })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(c.id)}>
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
        <CustomerDialog
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
                const result = await deleteCustomer(deleteId);
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

function CustomerDialog({
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
    const result = await upsertCustomer(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else toast.error(result.error);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial.id ? t("edit") : t("add")} Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" {...register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-logo">Logo URL</Label>
            <Input id="c-logo" {...register("logoUrl")} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="c-invert"
              checked={watch("invertOnDark")}
              onCheckedChange={(v) => setValue("invertOnDark", v, { shouldDirty: true })}
            />
            <Label htmlFor="c-invert">Invert on dark</Label>
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
