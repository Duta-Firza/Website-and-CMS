"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
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
import { deleteProject, reorderProjects, upsertProject } from "@/lib/cms/actions";
import { cn } from "@/lib/utils";
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

export function ProjectsManager({ initial }: { initial: ProjectRow[] }) {
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
      .filter((p): p is ProjectRow => !!p);
    setItems(next);
    const result = await reorderProjects(newIds);
    if (!result.ok) {
      toast.error(result.error);
      setItems(initial);
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Drag and drop reorders projects within their category.
        </p>
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
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead className="hidden md:table-cell">Year</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="w-16">Featured</TableHead>
              <TableHead className="w-16">Live</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <SortableContainer items={items.map((p) => p.id)} onReorder={handleReorder}>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                    No projects yet.
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
                      <TableCell className="max-w-xs">
                        <p className="font-medium">{p.title.id}</p>
                        <p className="text-xs text-muted-foreground">/{p.slug}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{p.client}</TableCell>
                      <TableCell className="hidden md:table-cell">{p.year ?? "—"}</TableCell>
                      <TableCell className="hidden capitalize md:table-cell">
                        {p.category}
                      </TableCell>
                      <TableCell>
                        {p.isHighlighted && <Star className="h-4 w-4 text-brand-accent" />}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                            p.isPublished
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {p.isPublished ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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
      </div>

      {editing && (
        <ProjectDialog
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
          <DialogTitle>{initial.id ? t("edit") : t("add")} Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pr-slug">Slug</Label>
              <Input id="pr-slug" {...register("slug")} placeholder="rdmp-balikpapan" />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-client">Client</Label>
              <Input id="pr-client" {...register("client")} />
            </div>
          </div>
          <LocalizedField label="Title" name="title" form={form} />
          <LocalizedField label="Summary" name="summary" form={form} multiline />
          <LocalizedField label="About the project" name="about" form={form} multiline />
          <LocalizedField
            label="Scope of work"
            name="scopeOfWork"
            form={form}
            multiline
            placeholder={{ id: "Satu item per baris", en: "One item per line" }}
          />
          <div className="space-y-2">
            <Label htmlFor="pr-image">Image URL</Label>
            <Input id="pr-image" {...register("image")} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pr-year">Year</Label>
              <Input id="pr-year" type="number" {...register("year", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
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
              <Label htmlFor="pr-horder">Featured order</Label>
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
              <Label htmlFor="pr-feat">Featured on homepage</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="pr-pub"
                checked={watch("isPublished")}
                onCheckedChange={(v) => setValue("isPublished", v, { shouldDirty: true })}
              />
              <Label htmlFor="pr-pub">Published</Label>
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
