"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImagePreview } from "@/components/admin/image-preview";
import { LocalizedField } from "@/components/admin/localized-field";
import { pickLocalized } from "@/components/admin/localized-text";
import { MediaUpload } from "@/components/admin/media-upload";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteLeadershipMember,
  reorderLeadership,
  upsertLeadershipMember,
} from "@/lib/cms/actions";
import { cn } from "@/lib/utils";
import { LEADERSHIP_TYPES, type LeadershipType } from "@/models/constants";
import type { LeadershipRow } from "./page";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  bio: z.object({ id: z.string(), en: z.string() }),
  photoUrl: z.string(),
  type: z.enum(LEADERSHIP_TYPES),
  order: z.number().int(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  name: "",
  title: { id: "", en: "" },
  bio: { id: "", en: "" },
  photoUrl: "",
  type: "director",
  order: 0,
  isActive: true,
};

export function LeadershipManager({ initial }: { initial: LeadershipRow[] }) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [items, setItems] = useState(initial);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const directors = useMemo(() => items.filter((m) => m.type === "director"), [items]);
  const commissioners = useMemo(() => items.filter((m) => m.type === "commissioner"), [items]);

  const handleReorder = (group: LeadershipType) => async (newIds: string[]) => {
    const others = items.filter((m) => m.type !== group);
    const reordered = newIds
      .map((id) => items.find((m) => m.id === id))
      .filter((m): m is LeadershipRow => !!m);
    setItems([...others, ...reordered]);
    const result = await reorderLeadership(newIds);
    if (!result.ok) {
      toast.error(result.error);
      setItems(initial);
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <MemberTable
        title="Board of Directors"
        emptyMessage="No directors yet."
        members={directors}
        onAdd={() => setEditing({ ...empty, type: "director", order: directors.length + 1 })}
        onEdit={(m) => setEditing({ ...m })}
        onDelete={(id) => setDeleteId(id)}
        onReorder={handleReorder("director")}
        addLabel={t("add")}
        locale={locale}
      />

      <div className="mt-8">
        <MemberTable
          title="Board of Commissioners"
          emptyMessage="No commissioners yet."
          members={commissioners}
          onAdd={() =>
            setEditing({ ...empty, type: "commissioner", order: commissioners.length + 1 })
          }
          onEdit={(m) => setEditing({ ...m })}
          onDelete={(id) => setDeleteId(id)}
          onReorder={handleReorder("commissioner")}
          addLabel={t("add")}
          locale={locale}
        />
      </div>

      {editing && (
        <LeadershipDialog
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
                const result = await deleteLeadershipMember(deleteId);
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

function MemberTable({
  title,
  emptyMessage,
  members,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  addLabel,
  locale,
}: {
  title: string;
  emptyMessage: string;
  members: LeadershipRow[];
  onAdd: () => void;
  onEdit: (m: LeadershipRow) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
  addLabel: string;
  locale: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-deep dark:text-foreground">
          {title}
        </h3>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Title</TableHead>
              <TableHead className="w-16">Active</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContainer items={members.map((m) => m.id)} onReorder={onReorder}>
            <TableBody>
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
              {members.map((m) => (
                <SortableItem key={m.id} id={m.id}>
                  {({ ref, style, handleProps }) => (
                    <TableRow ref={ref} style={style}>
                      <TableCell>
                        <DragHandle handleProps={handleProps} size="sm" />
                      </TableCell>
                      <TableCell>
                        <ImagePreview src={m.photoUrl} alt={m.name} />
                      </TableCell>
                      <TableCell className="max-w-48 font-medium">
                        <span className="block truncate" title={m.name}>
                          {m.name}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-xs md:table-cell">
                        <span className="block truncate" title={pickLocalized(m.title, locale)}>
                          {pickLocalized(m.title, locale)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                            m.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {m.isActive ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(m)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(m.id)}>
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
    </div>
  );
}

function LeadershipDialog({
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
    formState: { isSubmitting, errors },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await upsertLeadershipMember(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else toast.error(result.error);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial.id ? t("edit") : t("add")} Leadership Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lm-name">Name</Label>
            <Input id="lm-name" {...register("name")} placeholder="Full name" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <LocalizedField label="Title / Position" name="title" form={form} />
          <LocalizedField label="Bio" name="bio" form={form} multiline />
          <div className="space-y-2">
            <Label>Photo</Label>
            <MediaUpload
              value={watch("photoUrl")}
              onChange={(url) => setValue("photoUrl", url, { shouldDirty: true })}
              accept="image"
              folder="leadership"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v as LeadershipType, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEADERSHIP_TYPES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-7">
              <Switch
                id="lm-active"
                checked={watch("isActive")}
                onCheckedChange={(v) => setValue("isActive", v, { shouldDirty: true })}
              />
              <Label htmlFor="lm-active">Active</Label>
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
