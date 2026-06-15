"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import type { PartnerOption, ProductItemRow, ProductRow } from "./page";

const principleZod = z.object({
  partnerId: z.string().nullable(),
  name: z.string(),
  logoUrl: z.string(),
});

const itemZod = z.object({
  name: z.object({ id: z.string(), en: z.string() }),
  photos: z.array(z.string()),
});

const schema = z.object({
  id: z.string().optional(),
  principles: z.array(principleZod),
  origin: z.string(),
  productType: z.object({ id: z.string(), en: z.string() }),
  skuCount: z.number().int().nonnegative(),
  partnershipStart: z.number().int().nullable(),
  items: z.array(itemZod),
  order: z.number().int(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  principles: [],
  origin: "",
  productType: { id: "", en: "" },
  skuCount: 0,
  partnershipStart: null,
  items: [],
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
  const [viewing, setViewing] = useState<ProductRow | null>(null);
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
                  <TableHead className="w-32">{t("common.logo")}</TableHead>
                  <TableHead>{t("fields.principleName")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("fields.principleOrigin")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">{t("fields.productType")}</TableHead>
                  <TableHead className="hidden w-20 xl:table-cell">
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
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                        {t("empty.products")}
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((p) => {
                    const principleNames = p.principles
                      .map((pr) => partnerById.get(pr.partnerId ?? "")?.name ?? pr.name)
                      .filter(Boolean);
                    const principleLogos = p.principles
                      .map((pr) => partnerById.get(pr.partnerId ?? "")?.logoUrl ?? pr.logoUrl)
                      .filter(Boolean);
                    return (
                      <SortableItem key={p.id} id={p.id}>
                        {({ ref, style, handleProps }) => (
                          <TableRow ref={ref} style={style}>
                            <TableCell>
                              <DragHandle handleProps={handleProps} size="sm" />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {principleLogos.slice(0, 3).map((url, i) => (
                                  <ImagePreview
                                    // biome-ignore lint/suspicious/noArrayIndexKey: stable per product row
                                    key={i}
                                    src={url}
                                    alt={principleNames[i] || "Principle logo"}
                                  />
                                ))}
                                {principleLogos.length > 3 && (
                                  <span className="inline-flex h-8 items-center justify-center rounded-md border bg-muted px-2 text-[10px] font-semibold text-muted-foreground">
                                    +{principleLogos.length - 3}
                                  </span>
                                )}
                                {principleLogos.length === 0 && (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-48 font-medium">
                              <span className="block truncate" title={principleNames.join(" · ")}>
                                {principleNames.join(" · ") || "—"}
                              </span>
                            </TableCell>
                            <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                              {p.origin || "—"}
                            </TableCell>
                            <TableCell className="hidden max-w-xs text-sm text-muted-foreground lg:table-cell">
                              <span
                                className="block truncate"
                                title={pickLocalized(p.productType, locale)}
                              >
                                {pickLocalized(p.productType, locale) || "—"}
                              </span>
                            </TableCell>
                            <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
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

      <DetailDialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={
          viewing
            ? viewing.principles
                .map((pr) => partnerById.get(pr.partnerId ?? "")?.name ?? pr.name)
                .filter(Boolean)
                .join(" · ") || pickLocalized(viewing.productType, locale)
            : ""
        }
        fields={
          viewing
            ? [
                {
                  label: t("fields.principleLogo"),
                  value: viewing.principles
                    .map((pr) => partnerById.get(pr.partnerId ?? "")?.logoUrl ?? pr.logoUrl)
                    .filter(Boolean),
                  type: "imageList",
                },
                {
                  label: t("fields.principleName"),
                  value: viewing.principles
                    .map((pr) => partnerById.get(pr.partnerId ?? "")?.name ?? pr.name)
                    .filter(Boolean),
                  type: "list",
                },
                { label: t("fields.principleOrigin"), value: viewing.origin },
                {
                  label: t("fields.productType"),
                  value: viewing.productType,
                  type: "localized",
                },
                { label: t("fields.skuCount"), value: viewing.skuCount },
                {
                  label: t("fields.partnershipStart"),
                  value: viewing.partnershipStart ?? "",
                },
                {
                  label: t("fields.productItems"),
                  value: viewing.items,
                  type: "custom",
                  custom: <ProductItemsList items={viewing.items} locale={locale} />,
                },
                { label: t("common.active"), value: viewing.isActive, type: "boolean" },
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
    control,
    formState: { isSubmitting },
  } = form;

  const principlesArray = useFieldArray({ control, name: "principles" });
  const itemsArray = useFieldArray({ control, name: "items" });

  const onSubmit = async (values: FormValues) => {
    const result = await upsertProduct(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else toast.error(result.error);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {initial.id ? t("edit") : t("add")} {t("nouns.product")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Principles array — hybrid (partner link or manual) per entry */}
          <div className="space-y-3 rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <Label>
                {t("groups.principleSource")} · {principlesArray.fields.length}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => principlesArray.append({ partnerId: null, name: "", logoUrl: "" })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t("fields.principleName")}
              </Button>
            </div>
            {principlesArray.fields.length === 0 && (
              <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                {t("empty.products")}
              </p>
            )}
            <div className="space-y-3">
              {principlesArray.fields.map((field, i) => (
                <PrincipleEntryField
                  key={field.id}
                  index={i}
                  form={form}
                  partners={partners}
                  onRemove={() => principlesArray.remove(i)}
                  removeLabel={t("delete")}
                  linkLabel={t("fields.linkToPartner")}
                  nameLabel={t("fields.principleName")}
                  logoLabel={t("fields.principleLogo")}
                  logoHint={t("hints.partnerLogo")}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="pr-origin">{t("fields.principleOrigin")}</Label>
              <Input id="pr-origin" {...register("origin")} placeholder="USA / Japan / …" />
            </div>
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

          <LocalizedField
            label={t("fields.productType")}
            name="productType"
            form={form}
            multiline
          />

          {/* Items array — sub-products (Pressure Gauge / Pressure Switch / …) */}
          <div className="space-y-3 rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <Label>
                {t("groups.productDetails")} · {itemsArray.fields.length}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => itemsArray.append({ name: { id: "", en: "" }, photos: [] })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t("nouns.product")}
              </Button>
            </div>
            {itemsArray.fields.length === 0 && (
              <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                {t("mediaUpload.noMedia")}
              </p>
            )}
            <div className="space-y-4">
              {itemsArray.fields.map((field, i) => (
                <ProductItemField
                  key={field.id}
                  index={i}
                  form={form}
                  onRemove={() => itemsArray.remove(i)}
                  removeLabel={t("delete")}
                  nameLabel={t("fields.productType")}
                  photosLabel={t("fields.productPhotos")}
                  addPhotoLabel={t("fields.addPhoto")}
                  removePhotoLabel={t("fields.removePhoto")}
                  noPhotoLabel={t("mediaUpload.noMedia")}
                />
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

interface PrincipleEntryFieldProps {
  index: number;
  // biome-ignore lint/suspicious/noExplicitAny: react-hook-form types resolve at runtime via setValue/watch paths
  form: any;
  partners: PartnerOption[];
  onRemove: () => void;
  removeLabel: string;
  linkLabel: string;
  nameLabel: string;
  logoLabel: string;
  logoHint: string;
}

function PrincipleEntryField({
  index,
  form,
  partners,
  onRemove,
  removeLabel,
  linkLabel,
  nameLabel,
  logoLabel,
  logoHint,
}: PrincipleEntryFieldProps) {
  const partnerId: string | null = form.watch(`principles.${index}.partnerId`);
  const linked = Boolean(partnerId);
  const name: string = form.watch(`principles.${index}.name`);
  const logoUrl: string = form.watch(`principles.${index}.logoUrl`);

  return (
    <div className="space-y-3 rounded-md border bg-background p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            id={`link-partner-${index}`}
            checked={linked}
            onCheckedChange={(v) =>
              form.setValue(`principles.${index}.partnerId`, v ? (partners[0]?.id ?? null) : null, {
                shouldDirty: true,
              })
            }
          />
          <Label htmlFor={`link-partner-${index}`}>{linkLabel}</Label>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={removeLabel}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
      {linked ? (
        <div className="space-y-2">
          <Label>{nameLabel}</Label>
          <Select
            value={partnerId ?? ""}
            onValueChange={(v) =>
              form.setValue(`principles.${index}.partnerId`, v || null, { shouldDirty: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={nameLabel}>
                {partners.find((p) => p.id === partnerId)?.name ?? ""}
              </SelectValue>
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
            <Label htmlFor={`pr-name-${index}`}>{nameLabel}</Label>
            <Input
              id={`pr-name-${index}`}
              value={name}
              onChange={(e) =>
                form.setValue(`principles.${index}.name`, e.target.value, {
                  shouldDirty: true,
                })
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{logoLabel}</Label>
            <MediaUpload
              value={logoUrl}
              onChange={(url) =>
                form.setValue(`principles.${index}.logoUrl`, url, { shouldDirty: true })
              }
              accept="image"
              folder="products/logos"
              hint={logoHint}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductItemFieldProps {
  index: number;
  // biome-ignore lint/suspicious/noExplicitAny: react-hook-form types resolve at runtime via setValue/watch paths
  form: any;
  onRemove: () => void;
  removeLabel: string;
  nameLabel: string;
  photosLabel: string;
  addPhotoLabel: string;
  removePhotoLabel: string;
  noPhotoLabel: string;
}

function ProductItemField({
  index,
  form,
  onRemove,
  removeLabel,
  nameLabel,
  photosLabel,
  addPhotoLabel,
  removePhotoLabel,
  noPhotoLabel,
}: ProductItemFieldProps) {
  const photos: string[] = form.watch(`items.${index}.photos`) ?? [];
  return (
    <div className="space-y-3 rounded-md border bg-background p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          #{index + 1}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={removeLabel}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
      <LocalizedField label={nameLabel} name={`items.${index}.name`} form={form} />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{photosLabel}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              form.setValue(`items.${index}.photos`, [...photos, ""], { shouldDirty: true })
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            {addPhotoLabel}
          </Button>
        </div>
        {photos.length === 0 && (
          <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
            {noPhotoLabel}
          </p>
        )}
        <div className="space-y-3">
          {photos.map((photo, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: photo order is stable per item edit session
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <MediaUpload
                  value={photo}
                  onChange={(url) => {
                    const next = [...photos];
                    next[i] = url;
                    form.setValue(`items.${index}.photos`, next, { shouldDirty: true });
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
                  form.setValue(`items.${index}.photos`, next, { shouldDirty: true });
                }}
                aria-label={removePhotoLabel}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductItemsList({ items, locale }: { items: ProductItemRow[]; locale: string }) {
  if (items.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const itemName = pickLocalized(item.name, locale);
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: items are stable within the read-only detail view
            key={`${itemName}-${idx}`}
            className="space-y-2 rounded-md border bg-muted/30 p-2"
          >
            <p className="text-sm font-medium">{itemName || `Item ${idx + 1}`}</p>
            {item.photos.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {item.photos.map((src, pi) => (
                  <ImagePreview
                    // biome-ignore lint/suspicious/noArrayIndexKey: photos are stable within the read-only detail view
                    key={`${src}-${pi}`}
                    src={src}
                    alt={`${itemName || "Item"} ${pi + 1}`}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
