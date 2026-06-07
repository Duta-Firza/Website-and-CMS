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
import { LocalizedField } from "@/components/admin/localized-field";
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
import {
  deleteAffiliatedBusiness,
  reorderAffiliatedBusinesses,
  upsertAffiliatedBusiness,
} from "@/lib/cms/actions";
import type { AffiliatedBusinessRow } from "./page";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  logoUrl: z.string(),
  description: z.object({ id: z.string(), en: z.string() }),
  websiteUrl: z.string(),
  order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  name: "",
  logoUrl: "",
  description: { id: "", en: "" },
  websiteUrl: "",
  order: 0,
};

export function BusinessManager({ initial }: { initial: AffiliatedBusinessRow[] }) {
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
      .map((id) => items.find((b) => b.id === id))
      .filter((b): b is AffiliatedBusinessRow => !!b);
    setItems(next);
    const result = await reorderAffiliatedBusinesses(newIds);
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
              <TableHead className="hidden md:table-cell">Website</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContainer items={items.map((b) => b.id)} onReorder={handleReorder}>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No affiliated businesses yet.
                  </TableCell>
                </TableRow>
              )}
              {items.map((b) => (
                <SortableItem key={b.id} id={b.id}>
                  {({ ref, style, handleProps }) => (
                    <TableRow ref={ref} style={style}>
                      <TableCell>
                        <DragHandle handleProps={handleProps} size="sm" />
                      </TableCell>
                      <TableCell>
                        <ImagePreview src={b.logoUrl} alt={b.name} />
                      </TableCell>
                      <TableCell className="max-w-xs font-medium">
                        <span className="block truncate" title={b.name}>
                          {b.name}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-xs text-xs text-muted-foreground md:table-cell">
                        <span className="block truncate" title={b.websiteUrl || ""}>
                          {b.websiteUrl || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditing({ ...b })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(b.id)}>
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
        <BusinessDialog
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
                const result = await deleteAffiliatedBusiness(deleteId);
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

function BusinessDialog({
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
    formState: { isSubmitting, errors },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await upsertAffiliatedBusiness(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else toast.error(result.error);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial.id ? t("edit") : t("add")} Affiliated Business</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ab-name">Name</Label>
            <Input id="ab-name" {...register("name")} placeholder="PT Duta Firza Technologies" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ab-logo">Logo URL</Label>
            <Input id="ab-logo" {...register("logoUrl")} placeholder="https://… /logo.png" />
          </div>
          <LocalizedField label="Description" name="description" form={form} multiline />
          <div className="space-y-2">
            <Label htmlFor="ab-web">Website URL (optional)</Label>
            <Input id="ab-web" {...register("websiteUrl")} placeholder="https://…" />
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
