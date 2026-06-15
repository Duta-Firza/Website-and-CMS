"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DetailDialog } from "@/components/admin/detail-dialog";
import { ImagePreview } from "@/components/admin/image-preview";
import { LocalizedField } from "@/components/admin/localized-field";
import { pickLocalized } from "@/components/admin/localized-text";
import { MediaUpload } from "@/components/admin/media-upload";
import { DragHandle, SortableContainer, SortableItem } from "@/components/admin/sortable-list";
import { StatusToggle } from "@/components/admin/status-toggle";
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
import {
  deletePartner,
  reorderPartners,
  togglePartnerActive,
  upsertPartner,
} from "@/lib/cms/actions";
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
  const locale = useLocale();
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [viewing, setViewing] = useState<PartnerRow | null>(null);
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
      <div className="flex items-center justify-end gap-3">
        <Button onClick={() => setEditing({ ...empty, order: items.length + 1 })}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-16">{t("common.logo")}</TableHead>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("common.summary")}</TableHead>
              <TableHead className="w-20">{t("common.active")}</TableHead>
              <TableHead className="w-24 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContainer items={items.map((p) => p.id)} onReorder={handleReorder}>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    {t("empty.partners")}
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
                        <ImagePreview src={p.logoUrl} alt={p.name} invertOnDark={p.invertOnDark} />
                      </TableCell>
                      <TableCell className="max-w-48 font-medium">
                        <span className="block truncate" title={p.name}>
                          {p.name}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-xs text-sm text-muted-foreground md:table-cell">
                        <span className="block truncate" title={pickLocalized(p.summary, locale)}>
                          {pickLocalized(p.summary, locale)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusToggle
                          checked={p.isActive}
                          ariaLabel={t("common.active")}
                          onToggle={async (next) => {
                            setItems((prev) =>
                              prev.map((x) => (x.id === p.id ? { ...x, isActive: next } : x)),
                            );
                            const result = await togglePartnerActive(p.id, next);
                            if (!result.ok) {
                              setItems((prev) =>
                                prev.map((x) => (x.id === p.id ? { ...x, isActive: !next } : x)),
                              );
                              throw new Error(result.error);
                            }
                            router.refresh();
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setViewing(p)}
                            aria-label={t("common.view")}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
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

      <DetailDialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? ""}
        fields={
          viewing
            ? [
                { label: t("common.logo"), value: viewing.logoUrl, type: "image" },
                { label: t("common.name"), value: viewing.name },
                {
                  label: t("common.summary"),
                  value: viewing.summary,
                  type: "localizedLongtext",
                },
                { label: t("common.website"), value: viewing.websiteUrl, type: "url" },
                { label: t("common.active"), value: viewing.isActive, type: "boolean" },
                {
                  label: t("fields.invertOnDark"),
                  value: viewing.invertOnDark,
                  type: "boolean",
                },
                { label: t("common.order"), value: viewing.order },
              ]
            : []
        }
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("alertDelete")}</AlertDialogDescription>
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
          <DialogTitle>
            {initial.id ? t("edit") : t("add")} {t("nouns.partner")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">{t("common.name")}</Label>
            <Input id="p-name" {...register("name")} />
          </div>
          <div className="space-y-2">
            <Label>{t("common.logo")}</Label>
            <MediaUpload
              value={watch("logoUrl")}
              onChange={(url) => setValue("logoUrl", url, { shouldDirty: true })}
              accept="image"
              folder="partners"
              hint={t("hints.partnerLogo")}
            />
          </div>
          <LocalizedField label={t("common.summary")} name="summary" form={form} multiline />
          <div className="space-y-2">
            <Label htmlFor="p-web">{t("fields.websiteUrl")}</Label>
            <Input id="p-web" {...register("websiteUrl")} placeholder="https://..." />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="p-active"
                checked={watch("isActive")}
                onCheckedChange={(v) => setValue("isActive", v, { shouldDirty: true })}
              />
              <Label htmlFor="p-active">{t("fields.active")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="p-invert"
                checked={watch("invertOnDark")}
                onCheckedChange={(v) => setValue("invertOnDark", v, { shouldDirty: true })}
              />
              <Label htmlFor="p-invert">{t("fields.invertOnDark")}</Label>
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
