"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { IconPicker } from "@/components/admin/icon-picker";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { deleteSolution, upsertSolution } from "@/lib/cms/actions";
import { SOLUTION_ICONS } from "@/models/constants";

const schema = z.object({
  id: z.string().optional(),
  key: z.string().min(1, "Key wajib diisi"),
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  description: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  iconName: z.string().min(1),
  href: z.string().min(1),
  order: z.number().int(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  initial: {
    id?: string;
    key: string;
    title: { id: string; en: string };
    description: { id: string; en: string };
    iconName: string;
    href: string;
    order: number;
    isActive: boolean;
  };
  /** True for brand-new solutions not yet saved — key field is editable. */
  isNew?: boolean;
  onDeleted?: () => void;
  onSaved?: () => void;
}

export function SolutionForm({ initial, isNew = false, onDeleted, onSaved }: Props) {
  const t = useTranslations("Admin");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await upsertSolution(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved?.();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    if (!initial.id) {
      onDeleted?.();
      return;
    }
    setDeleting(true);
    const result = await deleteSolution(initial.id);
    setDeleting(false);
    if (result.ok) {
      toast.success(t("saved"));
      onDeleted?.();
    } else {
      toast.error(result.error);
    }
    setConfirmDelete(false);
  };

  const isActive = watch("isActive");

  return (
    <>
      <Card className={isActive ? undefined : "opacity-60"}>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="capitalize text-base">
              {isNew ? "New Solution" : initial.key}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                id={`active-${initial.key || initial.order}`}
                checked={isActive}
                onCheckedChange={(checked) =>
                  setValue("isActive", checked, { shouldDirty: true })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => (isNew && !initial.id ? onDeleted?.() : setConfirmDelete(true))}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isNew && (
              <div className="space-y-2">
                <Label htmlFor={`key-${initial.order}`}>Key (slug unik)</Label>
                <Input
                  id={`key-${initial.order}`}
                  {...register("key")}
                  placeholder="e.g. technology"
                />
                {errors.key && (
                  <p className="text-xs text-destructive">{errors.key.message}</p>
                )}
              </div>
            )}
            <LocalizedField label="Title" name="title" form={form} />
            <LocalizedField label="Description" name="description" form={form} multiline />
            <div className="space-y-2">
              <Label>Icon</Label>
              <IconPicker
                value={watch("iconName")}
                icons={SOLUTION_ICONS}
                onChange={(v) => setValue("iconName", v, { shouldDirty: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`href-${initial.key || initial.order}`}>Link</Label>
              <Input id={`href-${initial.key || initial.order}`} {...register("href")} />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
