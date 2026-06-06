"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { DragHandle, SortableContainer, SortableItem } from "@/components/admin/sortable-list";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
import { deletePartner, reorderPartners, upsertPartner } from "@/lib/cms/actions";
import { cn } from "@/lib/utils";
import type { PartnerRow } from "./page";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  logoUrl: z.string().min(1),
  summary: z.object({ id: z.string(), en: z.string() }),
  websiteUrl: z.string(),
  order: z.number().int(),
  isActive: z.boolean(),
  invertOnDark: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  name: "",
  logoUrl: "",
  summary: { id: "", en: "" },
  websiteUrl: "",
  order: 0,
  isActive: true,
  invertOnDark: false,
};

export function PartnersManager({ initial }: { initial: PartnerRow[] }) {
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
      .map((id) => items.find((p) => p.id === id))
      .filter((p): p is PartnerRow => !!p);
    setItems(next);
    const result = await reorderPartners(newIds);
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Summary (ID)</TableHead>
              <TableHead className="w-20">Active</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContainer items={items.map((p) => p.id)} onReorder={handleReorder}>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No partners yet.
                  </TableCell>
                </TableRow>
              )}
              {items.map((p) => (
                <SortableItem key={p.id} id={p.id}>
                  {({ ref, style, handleProps }) => (
                    <TableRow ref={ref} style={style}>
                      <TableCell>
                        <DragHandle handleProps={handleProps} size="sm" />
                      </TableCell>
                      <TableCell>
                        {p.logoUrl && (
                          <Image
                            src={p.logoUrl}
                            alt={p.name}
                            width={48}
                            height={32}
                            className="h-8 w-auto object-contain"
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="hidden max-w-md truncate text-sm text-muted-foreground md:table-cell">
                        {p.summary.id}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                            p.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {p.isActive ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditing({ ...p })}
                            aria-label={t("edit")}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteId(p.id)}
                            aria-label={t("delete")}
                          >
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
        <PartnerDialog
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
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async () => {
                if (!deleteId) return;
                const result = await deletePartner(deleteId);
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

function PartnerDialog({
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
    const result = await upsertPartner(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else toast.error(result.error);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial.id ? t("edit") : t("add")} Partner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" {...register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-logo">Logo URL</Label>
            <Input id="p-logo" {...register("logoUrl")} placeholder="https://..." />
          </div>
          <LocalizedField label="Summary" name="summary" form={form} multiline />
          <div className="space-y-2">
            <Label htmlFor="p-web">Website URL</Label>
            <Input id="p-web" {...register("websiteUrl")} placeholder="https://..." />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="p-active"
                checked={watch("isActive")}
                onCheckedChange={(v) => setValue("isActive", v, { shouldDirty: true })}
              />
              <Label htmlFor="p-active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="p-invert"
                checked={watch("invertOnDark")}
                onCheckedChange={(v) => setValue("invertOnDark", v, { shouldDirty: true })}
              />
              <Label htmlFor="p-invert">Invert on dark</Label>
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
