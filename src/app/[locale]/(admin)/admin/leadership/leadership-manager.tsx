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
import { deleteLeadershipMember, upsertLeadershipMember } from "@/lib/cms/actions";
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
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setEditing(empty)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Title</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="w-16">Order</TableHead>
              <TableHead className="w-16">Active</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initial.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  No leadership members yet.
                </TableCell>
              </TableRow>
            )}
            {initial.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="hidden md:table-cell">{m.title.id}</TableCell>
                <TableCell className="hidden capitalize md:table-cell">{m.type}</TableCell>
                <TableCell>{m.order}</TableCell>
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
                    <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ ...m })}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(m.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
            <Label htmlFor="lm-photo">Photo URL</Label>
            <Input id="lm-photo" {...register("photoUrl")} placeholder="https://… /photo.jpg" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            <div className="space-y-2">
              <Label htmlFor="lm-order">Order</Label>
              <Input id="lm-order" type="number" {...register("order", { valueAsNumber: true })} />
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
