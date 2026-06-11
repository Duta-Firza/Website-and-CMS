"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DetailDialog } from "@/components/admin/detail-dialog";
import { ImagePreview } from "@/components/admin/image-preview";
import { LocalizedField } from "@/components/admin/localized-field";
import { pickLocalized } from "@/components/admin/localized-text";
import { MediaUpload } from "@/components/admin/media-upload";
import { DragHandle, SortableContainer, SortableItem } from "@/components/admin/sortable-list";
import { useUrlTabState } from "@/components/admin/url-tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteCredential, reorderCredentials, upsertCredential } from "@/lib/cms/actions";
import { CREDENTIAL_TYPES, type CredentialType } from "@/models/constants";
import type { CredentialRow } from "./page";

const schema = z.object({
  id: z.string().optional(),
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  description: z.object({ id: z.string(), en: z.string() }),
  imageUrl: z.string(),
  type: z.enum(CREDENTIAL_TYPES),
  issuer: z.string(),
  year: z.number().int().optional(),
  order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

const empty = (type: CredentialType = "certification"): FormValues => ({
  title: { id: "", en: "" },
  description: { id: "", en: "" },
  imageUrl: "",
  type,
  issuer: "",
  year: undefined,
  order: 0,
});

export function CredentialsManager({ initial }: { initial: CredentialRow[] }) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [activeType, setActiveType] = useUrlTabState<CredentialType>(
    "certification",
    CREDENTIAL_TYPES,
    "credType",
  );
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [viewing, setViewing] = useState<CredentialRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [items, setItems] = useState(initial);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const filtered = useMemo(() => items.filter((c) => c.type === activeType), [items, activeType]);

  const handleReorder = async (newIds: string[]) => {
    const others = items.filter((c) => c.type !== activeType);
    const newOrder = newIds
      .map((id) => items.find((c) => c.id === id))
      .filter((c): c is CredentialRow => !!c);
    setItems([...others, ...newOrder]);
    const result = await reorderCredentials(newIds);
    if (!result.ok) {
      toast.error(result.error);
      setItems(initial);
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as CredentialType)}>
          <TabsList>
            <TabsTrigger value="certification">{t("tabs.certifications")}</TabsTrigger>
            <TabsTrigger value="acknowledgement">{t("tabs.acknowledgements")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setEditing({ ...empty(activeType), order: filtered.length + 1 })}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-16">{t("common.image")}</TableHead>
              <TableHead>{t("common.title")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("common.issuer")}</TableHead>
              <TableHead className="hidden w-20 md:table-cell">{t("common.year")}</TableHead>
              <TableHead className="w-24 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContainer items={filtered.map((c) => c.id)} onReorder={handleReorder}>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    {activeType === "certification"
                      ? t("empty.certifications")
                      : t("empty.acknowledgements")}
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c) => (
                <SortableItem key={c.id} id={c.id}>
                  {({ ref, style, handleProps }) => (
                    <TableRow ref={ref} style={style}>
                      <TableCell>
                        <DragHandle handleProps={handleProps} size="sm" />
                      </TableCell>
                      <TableCell>
                        <ImagePreview src={c.imageUrl} alt={pickLocalized(c.title, locale)} />
                      </TableCell>
                      <TableCell className="max-w-xs font-medium">
                        <span className="block truncate" title={pickLocalized(c.title, locale)}>
                          {pickLocalized(c.title, locale)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-40 text-xs text-muted-foreground md:table-cell">
                        <span className="block truncate" title={c.issuer || ""}>
                          {c.issuer || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{c.year ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => setViewing(c)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
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
        <CredentialDialog
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
        title={viewing ? pickLocalized(viewing.title, locale) : ""}
        fields={
          viewing
            ? [
                { label: t("common.image"), value: viewing.imageUrl, type: "image" },
                { label: t("common.title"), value: viewing.title, type: "localized" },
                {
                  label: t("common.description"),
                  value: viewing.description,
                  type: "localizedLongtext",
                },
                {
                  label: t("common.type"),
                  value:
                    viewing.type === "certification"
                      ? t("nouns.certification")
                      : t("nouns.acknowledgement"),
                },
                { label: t("common.issuer"), value: viewing.issuer },
                { label: t("common.year"), value: viewing.year ?? "" },
                { label: t("common.order"), value: viewing.order },
              ]
            : []
        }
      />

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
                const result = await deleteCredential(deleteId);
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

function CredentialDialog({
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
    const result = await upsertCredential(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else toast.error(result.error);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initial.id ? t("edit") : t("add")}{" "}
            {initial.type === "certification"
              ? t("nouns.certification")
              : t("nouns.acknowledgement")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <LocalizedField label={t("common.title")} name="title" form={form} />
          <LocalizedField
            label={t("common.description")}
            name="description"
            form={form}
            multiline
          />
          <div className="space-y-2">
            <Label>{t("common.image")}</Label>
            <MediaUpload
              value={watch("imageUrl")}
              onChange={(url) => setValue("imageUrl", url, { shouldDirty: true })}
              accept="image"
              folder="credentials"
              aspectRatio={3 / 4}
              hint={t("hints.credentialImage")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("common.type")}</Label>
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v as CredentialType, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDENTIAL_TYPES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-issuer">{t("common.issuer")}</Label>
              <Input id="cr-issuer" {...register("issuer")} placeholder="TNV / SKK Migas / …" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-year">{t("common.year")}</Label>
              <Input id="cr-year" type="number" {...register("year", { valueAsNumber: true })} />
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
