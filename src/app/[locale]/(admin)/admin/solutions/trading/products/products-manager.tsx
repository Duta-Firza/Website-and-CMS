"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  deleteProduct,
  reorderProducts,
  toggleProductActive,
  upsertProduct,
} from "@/lib/cms/actions";
import type { PartnerOption, ProductRow } from "./page";

const schema = z.object({
  id: z.string().optional(),
  partnerId: z.string().nullable(),
  principleOverride: z.object({
    name: z.string(),
    logoUrl: z.string(),
    origin: z.string(),
  }),
  productType: z.object({ id: z.string(), en: z.string() }),
  skuCount: z.number().int().nonnegative(),
  partnershipStart: z.number().int().nullable(),
  photos: z.array(z.string()),
  order: z.number().int(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  partnerId: null,
  principleOverride: { name: "", logoUrl: "", origin: "" },
  productType: { id: "", en: "" },
  skuCount: 0,
  partnershipStart: null,
  photos: [],
  order: 0,
  isActive: true,
};

interface Props {
  initial: ProductRow[];
  partners: PartnerOption[];
}

export function ProductsManager({ initial, partners }: Props) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const handleReorder = async (newIds: string[]) => {
    const next = newIds
      .map((id) => items.find((p) => p.id === id))
      .filter((p): p is ProductRow => !!p);
    setItems(next);
    const result = await reorderProducts(newIds);
    if (!result.ok) {
      toast.error(result.error);
      setItems(initial);
    } else {
      router.refresh();
    }
  };

  const partnerById = new Map(partners.map((p) => [p.id, p]));

  return (
    <section className="space-y-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>
            {t("nouns.product")} · {items.length}
          </CardTitle>
          <Button onClick={() => setEditing({ ...empty, order: items.length + 1 })}>
            <Plus className="mr-2 h-4 w-4" />
            {t("add")}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="w-16">{t("common.logo")}</TableHead>
                  <TableHead>{t("fields.principleName")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("fields.productType")}</TableHead>
                  <TableHead className="hidden w-24 lg:table-cell">
                    {t("fields.skuCount")}
                  </TableHead>
                  <TableHead className="w-20">{t("common.active")}</TableHead>
                  <TableHead className="w-24 text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <SortableContainer items={items.map((p) => p.id)} onReorder={handleReorder}>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                        {t("empty.products")}
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((p) => {
                    const partner = p.partnerId ? partnerById.get(p.partnerId) : undefined;
                    const principleName = partner?.name ?? p.principleOverride.name;
                    const logoUrl = partner?.logoUrl ?? p.principleOverride.logoUrl;
                    return (
                      <SortableItem key={p.id} id={p.id}>
                        {({ ref, style, handleProps }) => (
                          <TableRow ref={ref} style={style}>
                            <TableCell>
                              <DragHandle handleProps={handleProps} size="sm" />
                            </TableCell>
                            <TableCell>
                              <ImagePreview src={logoUrl} alt={principleName || "—"} />
                            </TableCell>
                            <TableCell className="max-w-48 font-medium">
                              <span className="block truncate" title={principleName}>
                                {principleName || "—"}
                              </span>
                            </TableCell>
                            <TableCell className="hidden max-w-xs text-sm text-muted-foreground md:table-cell">
                              <span
                                className="block truncate"
                                title={pickLocalized(p.productType, locale)}
                              >
                                {pickLocalized(p.productType, locale) || "—"}
                              </span>
                            </TableCell>
                            <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                              {p.skuCount > 0 ? p.skuCount : "—"}
                            </TableCell>
                            <TableCell>
                              <StatusToggle
                                checked={p.isActive}
                                ariaLabel={t("common.active")}
                                onToggle={async (next) => {
                                  setItems((prev) =>
                                    prev.map((x) => (x.id === p.id ? { ...x, isActive: next } : x)),
                                  );
                                  const result = await toggleProductActive(p.id, next);
                                  if (!result.ok) {
                                    setItems((prev) =>
                                      prev.map((x) =>
                                        x.id === p.id ? { ...x, isActive: !next } : x,
                                      ),
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
                    );
                  })}
                </TableBody>
              </SortableContainer>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editing && (
        <ProductDialog
          initial={editing}
          partners={partners}
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
            <AlertDialogDescription>{t("alertDelete")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async () => {
                if (!deleteId) return;
                const result = await deleteProduct(deleteId);
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
    </section>
  );
}

function ProductDialog({
  initial,
  partners,
  onClose,
  onSaved,
}: {
  initial: FormValues;
  partners: PartnerOption[];
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

  const linkedPartnerId = watch("partnerId");
  const linked = Boolean(linkedPartnerId);
  const photos = watch("photos");

  const onSubmit = async (values: FormValues) => {
    const result = await upsertProduct(values);
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
            {initial.id ? t("edit") : t("add")} {t("nouns.product")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3 rounded-md border bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              <Switch
                id="link-partner"
                checked={linked}
                onCheckedChange={(v) =>
                  setValue("partnerId", v ? (partners[0]?.id ?? null) : null, {
                    shouldDirty: true,
                  })
                }
              />
              <Label htmlFor="link-partner">{t("fields.linkToPartner")}</Label>
            </div>
            {linked ? (
              <div className="space-y-2">
                <Label>{t("fields.principleName")}</Label>
                <Select
                  value={linkedPartnerId ?? ""}
                  onValueChange={(v) => setValue("partnerId", v || null, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pr-name">{t("fields.principleName")}</Label>
                  <Input id="pr-name" {...register("principleOverride.name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pr-origin">{t("fields.principleOrigin")}</Label>
                  <Input
                    id="pr-origin"
                    {...register("principleOverride.origin")}
                    placeholder="USA / Japan / …"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>{t("fields.principleLogo")}</Label>
                  <MediaUpload
                    value={watch("principleOverride.logoUrl")}
                    onChange={(url) =>
                      setValue("principleOverride.logoUrl", url, { shouldDirty: true })
                    }
                    accept="image"
                    folder="products/logos"
                    hint={t("hints.partnerLogo")}
                  />
                </div>
              </div>
            )}
          </div>

          <LocalizedField
            label={t("fields.productType")}
            name="productType"
            form={form}
            multiline
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pr-sku">{t("fields.skuCount")}</Label>
              <Input
                id="pr-sku"
                type="number"
                min={0}
                {...register("skuCount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-pship">{t("fields.partnershipStart")}</Label>
              <Input
                id="pr-pship"
                type="number"
                min={1900}
                max={2100}
                placeholder="2010"
                {...register("partnershipStart", {
                  setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("fields.productPhotos")}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue("photos", [...photos, ""], { shouldDirty: true })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t("fields.addPhoto")}
              </Button>
            </div>
            {photos.length === 0 && (
              <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                {t("mediaUpload.noMedia")}
              </p>
            )}
            <div className="space-y-3">
              {photos.map((photo, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: order is stable within a single dialog edit session
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-1">
                    <MediaUpload
                      value={photo}
                      onChange={(url) => {
                        const next = [...photos];
                        next[i] = url;
                        setValue("photos", next, { shouldDirty: true });
                      }}
                      accept="image"
                      folder="products/photos"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      const next = photos.filter((_, j) => j !== i);
                      setValue("photos", next, { shouldDirty: true });
                    }}
                    aria-label={t("fields.removePhoto")}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="pr-active"
              checked={watch("isActive")}
              onCheckedChange={(v) => setValue("isActive", v, { shouldDirty: true })}
            />
            <Label htmlFor="pr-active">{t("fields.active")}</Label>
          </div>

          {errors.productType && (
            <p className="text-xs text-destructive">{String(errors.productType.message)}</p>
          )}

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
