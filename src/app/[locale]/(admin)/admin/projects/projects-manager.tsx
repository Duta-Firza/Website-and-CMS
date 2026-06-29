"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { DetailDialog } from "@/components/admin/detail-dialog";
import { ImagePreview } from "@/components/admin/image-preview";
import { LocalizedField } from "@/components/admin/localized-field";
import { pickLocalized } from "@/components/admin/localized-text";
import { MediaUpload } from "@/components/admin/media-upload";
import { DragHandle, SortableContainer, SortableItem } from "@/components/admin/sortable-list";
import { StatusToggle } from "@/components/admin/status-toggle";
import { TablePagination } from "@/components/admin/table-pagination";
import { useAdminListParams } from "@/components/admin/use-admin-list-params";
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
  deleteProject,
  reorderProjects,
  toggleProjectHighlighted,
  toggleProjectPublished,
  upsertProject,
} from "@/lib/cms/actions";
import { PROJECT_CATEGORIES, type ProjectCategory } from "@/models/constants";
import type { ProjectRow } from "./page";

const schema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  summary: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  image: z.string().min(1),
  client: z.string(),
  year: z.number().int().optional(),
  category: z.enum(PROJECT_CATEGORIES),
  about: z.object({ id: z.string(), en: z.string() }),
  scopeOfWork: z.object({ id: z.string(), en: z.string() }),
  isHighlighted: z.boolean(),
  highlightOrder: z.number().int(),
  order: z.number().int(),
  isPublished: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function dedupeSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

const empty: FormValues = {
  slug: "",
  title: { id: "", en: "" },
  summary: { id: "", en: "" },
  image: "",
  client: "",
  year: undefined,
  category: "epc",
  about: { id: "", en: "" },
  scopeOfWork: { id: "", en: "" },
  isHighlighted: false,
  highlightOrder: 0,
  order: 0,
  isPublished: true,
};

interface ProjectsManagerProps {
  items: ProjectRow[];
  total: number;
  allIds: string[];
  allSlugs: string[];
}

export function ProjectsManager({ items, total, allIds, allSlugs }: ProjectsManagerProps) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const locale = useLocale();
  const lp = useAdminListParams("manual");
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [viewing, setViewing] = useState<ProjectRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Optimistic copy of the current (server-provided) page.
  const [rows, setRows] = useState(items);

  useEffect(() => {
    setRows(items);
  }, [items]);

  const isPristine = !lp.q && lp.filter === "all" && lp.status === "all" && lp.sort === "manual";

  const pageCount = Math.max(1, Math.ceil(total / lp.pageSize));
  const currentPage = Math.min(lp.page, pageCount);
  const pageStart = (currentPage - 1) * lp.pageSize;

  // Drag is only enabled in the pristine view, where the server page is a
  // contiguous slice of the canonical (manual) order. Splice the reordered
  // slice back into the full id list; reorderProjects re-numbers each category
  // from the relative order in that list.
  const handleReorder = async (newPageIds: string[]) => {
    const fullIds = [...allIds];
    fullIds.splice(pageStart, rows.length, ...newPageIds);
    setRows((prev) =>
      newPageIds.map((id) => prev.find((p) => p.id === id)).filter((p): p is ProjectRow => !!p),
    );
    const result = await reorderProjects(fullIds);
    if (!result.ok) {
      toast.error(result.error);
      router.refresh();
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-48 flex-1">
          <AdminListToolbar
            params={lp}
            searchPlaceholder={t("common.searchProjects")}
            sortLabel={t("common.sortBy")}
            sortOptions={[
              { value: "manual", label: t("sort.manual") },
              { value: "titleAsc", label: t("sort.titleAsc") },
              { value: "titleDesc", label: t("sort.titleDesc") },
              { value: "yearNewest", label: t("sort.yearNewest") },
              { value: "yearOldest", label: t("sort.yearOldest") },
            ]}
            filterLabel={t("common.category")}
            filterOptions={[
              { value: "all", label: t("common.allCategories") },
              ...PROJECT_CATEGORIES.map((c) => ({
                value: c,
                label: c.charAt(0).toUpperCase() + c.slice(1),
              })),
            ]}
            statusLabel={t("common.status")}
            statusOptions={[
              { value: "all", label: t("common.allStatuses") },
              { value: "published", label: t("common.published") },
              { value: "unpublished", label: t("common.unpublished") },
            ]}
          />
        </div>
        <Button onClick={() => setEditing({ ...empty, order: total + 1 })}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {isPristine ? t("helpers.reorderProjectsByCategory") : t("common.reorderHint")}
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-16">{t("common.image")}</TableHead>
              <TableHead>{t("common.title")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("common.client")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("common.year")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("common.category")}</TableHead>
              <TableHead className="w-16">{t("common.featured")}</TableHead>
              <TableHead className="w-16">{t("common.live")}</TableHead>
              <TableHead className="w-24 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContainer items={rows.map((p) => p.id)} onReorder={handleReorder}>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                    {isPristine ? t("empty.projects") : t("common.noResults")}
                  </TableCell>
                </TableRow>
              )}
              {rows.map((p) => (
                <SortableItem key={p.id} id={p.id}>
                  {({ ref, style, handleProps }) => (
                    <TableRow ref={ref} style={style}>
                      <TableCell>
                        {isPristine && <DragHandle handleProps={handleProps} size="sm" />}
                      </TableCell>
                      <TableCell>
                        <ImagePreview src={p.image} alt={pickLocalized(p.title, locale)} />
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate font-medium" title={pickLocalized(p.title, locale)}>
                          {pickLocalized(p.title, locale)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground" title={`/${p.slug}`}>
                          /{p.slug}
                        </p>
                      </TableCell>
                      <TableCell className="hidden max-w-40 md:table-cell">
                        <span className="block truncate" title={p.client}>
                          {p.client}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{p.year ?? "—"}</TableCell>
                      <TableCell className="hidden capitalize md:table-cell">
                        {p.category}
                      </TableCell>
                      <TableCell>
                        <StatusToggle
                          checked={p.isHighlighted}
                          ariaLabel={t("common.featured")}
                          onToggle={async (next) => {
                            setRows((prev) =>
                              prev.map((x) => (x.id === p.id ? { ...x, isHighlighted: next } : x)),
                            );
                            const result = await toggleProjectHighlighted(p.id, next);
                            if (!result.ok) {
                              setRows((prev) =>
                                prev.map((x) =>
                                  x.id === p.id ? { ...x, isHighlighted: !next } : x,
                                ),
                              );
                              throw new Error(result.error);
                            }
                            router.refresh();
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusToggle
                          checked={p.isPublished}
                          ariaLabel={t("common.live")}
                          onToggle={async (next) => {
                            setRows((prev) =>
                              prev.map((x) => (x.id === p.id ? { ...x, isPublished: next } : x)),
                            );
                            const result = await toggleProjectPublished(p.id, next);
                            if (!result.ok) {
                              setRows((prev) =>
                                prev.map((x) => (x.id === p.id ? { ...x, isPublished: !next } : x)),
                              );
                              throw new Error(result.error);
                            }
                            router.refresh();
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => setViewing(p)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditing({ ...p })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(p.id)}>
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
        {total > 0 && (
          <TablePagination
            page={currentPage}
            pageCount={pageCount}
            pageSize={lp.pageSize}
            total={total}
            rangeFrom={pageStart + 1}
            rangeTo={pageStart + rows.length}
            onPage={(p) => lp.update({ page: p <= 1 ? null : p })}
            onPageSize={(n) => lp.update({ size: n === 10 ? null : n })}
          />
        )}
      </div>

      {editing && (
        <ProjectDialog
          initial={editing}
          existingSlugs={allSlugs}
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
                { label: t("common.image"), value: viewing.image, type: "image" },
                { label: t("common.title"), value: viewing.title, type: "localized" },
                { label: t("common.slug"), value: viewing.slug },
                {
                  label: t("common.summary"),
                  value: viewing.summary,
                  type: "localizedLongtext",
                },
                {
                  label: t("fields.aboutProject"),
                  value: viewing.about,
                  type: "localizedLongtext",
                },
                {
                  label: t("fields.scopeOfWork"),
                  value: viewing.scopeOfWork,
                  type: "localizedLongtext",
                },
                { label: t("common.client"), value: viewing.client },
                { label: t("common.year"), value: viewing.year ?? "" },
                { label: t("common.category"), value: viewing.category },
                {
                  label: t("common.published"),
                  value: viewing.isPublished,
                  type: "boolean",
                },
                {
                  label: t("common.featured"),
                  value: viewing.isHighlighted,
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
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async () => {
                if (!deleteId) return;
                const result = await deleteProject(deleteId);
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

function ProjectDialog({
  initial,
  existingSlugs,
  onClose,
  onSaved,
}: {
  initial: FormValues;
  existingSlugs: string[];
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

  // For existing entries the slug is treated as manual (don't overwrite). For
  // new entries it auto-fills from the Indonesian title until the user types
  // into the slug field.
  const [manualSlug, setManualSlug] = useState(Boolean(initial.id));
  const titleId = watch("title.id");

  useEffect(() => {
    if (manualSlug) return;
    const base = slugify(titleId ?? "");
    if (!base) return;
    const taken = new Set(existingSlugs.filter((s) => s !== initial.slug));
    setValue("slug", dedupeSlug(base, taken), { shouldDirty: true });
  }, [titleId, manualSlug, existingSlugs, initial.slug, setValue]);

  const onSubmit = async (values: FormValues) => {
    const result = await upsertProject(values);
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
            {initial.id ? t("edit") : t("add")} {t("nouns.project")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pr-slug">{t("common.slug")}</Label>
                {manualSlug && !initial.id && (
                  <button
                    type="button"
                    onClick={() => setManualSlug(false)}
                    className="text-xs text-muted-foreground hover:text-brand-accent"
                  >
                    {t("buttons.resetAuto")}
                  </button>
                )}
              </div>
              <Input
                id="pr-slug"
                {...register("slug", {
                  onChange: () => setManualSlug(true),
                })}
                placeholder="auto"
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              {!manualSlug && (
                <p className="text-xs text-muted-foreground">{t("helpers.slugAutoActive")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-client">{t("common.client")}</Label>
              <Input id="pr-client" {...register("client")} />
            </div>
          </div>
          <LocalizedField label={t("common.title")} name="title" form={form} />
          <LocalizedField label={t("common.summary")} name="summary" form={form} multiline />
          <LocalizedField label={t("fields.aboutProject")} name="about" form={form} multiline />
          <LocalizedField
            label={t("fields.scopeOfWork")}
            name="scopeOfWork"
            form={form}
            multiline
            placeholder={{ id: "Satu item per baris", en: "One item per line" }}
          />
          <div className="space-y-2">
            <Label>{t("common.image")}</Label>
            <MediaUpload
              value={watch("image")}
              onChange={(url) => setValue("image", url, { shouldDirty: true })}
              accept="image"
              folder="projects"
              aspectRatio={16 / 9}
              hint={t("hints.projectImage")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pr-year">{t("common.year")}</Label>
              <Input id="pr-year" type="number" {...register("year", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t("common.category")}</Label>
              <Select
                value={watch("category")}
                onValueChange={(v) =>
                  setValue("category", v as ProjectCategory, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-horder">{t("fields.highlightOrder")}</Label>
              <Input
                id="pr-horder"
                type="number"
                {...register("highlightOrder", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="pr-feat"
                checked={watch("isHighlighted")}
                onCheckedChange={(v) => setValue("isHighlighted", v, { shouldDirty: true })}
              />
              <Label htmlFor="pr-feat">{t("fields.featuredOnHomepage")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="pr-pub"
                checked={watch("isPublished")}
                onCheckedChange={(v) => setValue("isPublished", v, { shouldDirty: true })}
              />
              <Label htmlFor="pr-pub">{t("fields.published")}</Label>
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
