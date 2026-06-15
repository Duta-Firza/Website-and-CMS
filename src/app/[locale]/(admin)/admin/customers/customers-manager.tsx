"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, GripVertical, LayoutGrid, List, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DetailDialog } from "@/components/admin/detail-dialog";
import { ImagePreview } from "@/components/admin/image-preview";
import { MediaUpload } from "@/components/admin/media-upload";
import { DragHandle, SortableContainer, SortableItem } from "@/components/admin/sortable-list";
import { StatusToggle } from "@/components/admin/status-toggle";
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
  deleteCustomer,
  reorderCustomers,
  toggleCustomerActive,
  upsertCustomer,
} from "@/lib/cms/actions";
import { cn } from "@/lib/utils";
import type { CustomerRow } from "./page";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  logoUrl: z.string().min(1),
  order: z.number().int(),
  invertOnDark: z.boolean(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
const empty: FormValues = {
  name: "",
  logoUrl: "",
  order: 0,
  invertOnDark: false,
  isActive: true,
};

type ViewMode = "card" | "table";
const VIEW_MODE_KEY = "customers-view-mode";

export function CustomersManager({ initial }: { initial: CustomerRow[] }) {
  const router = useRouter();
  const t = useTranslations("Admin");
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [viewing, setViewing] = useState<CustomerRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [items, setItems] = useState(initial);
  const [mode, setMode] = useState<ViewMode>("card");

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_MODE_KEY);
    if (saved === "card" || saved === "table") setMode(saved);
  }, []);

  const updateMode = (next: ViewMode) => {
    setMode(next);
    window.localStorage.setItem(VIEW_MODE_KEY, next);
  };

  const handleReorder = async (newIds: string[]) => {
    const next = newIds
      .map((id) => items.find((c) => c.id === id))
      .filter((c): c is CustomerRow => !!c);
    setItems(next);
    const result = await reorderCustomers(newIds);
    if (!result.ok) {
      toast.error(result.error);
      setItems(initial);
    } else {
      router.refresh();
    }
  };

  const handleToggleActive = async (id: string, next: boolean) => {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: next } : c)));
    const result = await toggleCustomerActive(id, next);
    if (!result.ok) {
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !next } : c)));
      throw new Error(result.error);
    }
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <ViewModeToggle mode={mode} onChange={updateMode} t={t} />
        <Button onClick={() => setEditing({ ...empty, order: items.length + 1 })}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      {mode === "card" ? (
        <CardGrid
          items={items}
          onReorder={handleReorder}
          onView={(c) => setViewing(c)}
          onEdit={(c) => setEditing({ ...c })}
          onDelete={(id) => setDeleteId(id)}
          onToggleActive={handleToggleActive}
          activeLabel={t("common.active")}
          emptyMessage={t("empty.customers")}
        />
      ) : (
        <TableView
          items={items}
          onReorder={handleReorder}
          onView={(c) => setViewing(c)}
          onEdit={(c) => setEditing({ ...c })}
          onDelete={(id) => setDeleteId(id)}
          onToggleActive={handleToggleActive}
          activeLabel={t("common.active")}
          emptyMessage={t("empty.customers")}
          t={t}
        />
      )}

      {editing && (
        <CustomerDialog
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
                  label: t("fields.invertOnDark"),
                  value: viewing.invertOnDark,
                  type: "boolean",
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
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async () => {
                if (!deleteId) return;
                const result = await deleteCustomer(deleteId);
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

function ViewModeToggle({
  mode,
  onChange,
  t,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
  t: (k: string) => string;
}) {
  return (
    <div className="inline-flex rounded-md border bg-card p-0.5">
      <button
        type="button"
        onClick={() => onChange("card")}
        aria-pressed={mode === "card"}
        title={t("viewMode.card")}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded transition-colors",
          mode === "card"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        aria-pressed={mode === "table"}
        title={t("viewMode.table")}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded transition-colors",
          mode === "table"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <List className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface ListProps {
  items: CustomerRow[];
  onReorder: (ids: string[]) => void;
  onView: (c: CustomerRow) => void;
  onEdit: (c: CustomerRow) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, next: boolean) => Promise<void>;
  activeLabel: string;
  emptyMessage: string;
}

function CardGrid({
  items,
  onReorder,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  activeLabel,
  emptyMessage,
}: ListProps) {
  if (items.length === 0) {
    return (
      <div className="mt-4 rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <SortableContainer items={items.map((c) => c.id)} onReorder={onReorder} strategy="grid">
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((c) => (
          <SortableItem key={c.id} id={c.id}>
            {({ ref, style, handleProps }) => (
              <div
                ref={ref}
                style={style}
                className={cn(
                  "group relative flex flex-col rounded-lg border bg-card p-3 transition-opacity",
                  !c.isActive && "opacity-60",
                )}
              >
                {/* Whole image area is the drag activator — 5px PointerSensor
                    constraint means short clicks still work on buttons below. */}
                <div
                  {...handleProps}
                  className="relative flex aspect-3/2 cursor-grab items-center justify-center overflow-hidden rounded-md bg-muted/30 active:cursor-grabbing"
                >
                  {c.logoUrl ? (
                    <Image
                      src={c.logoUrl}
                      alt={c.name}
                      width={300}
                      height={200}
                      className={cn(
                        "h-full w-full object-contain p-3",
                        c.invertOnDark && "dark:invert",
                      )}
                      draggable={false}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                  <span className="absolute left-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <GripVertical className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-medium" title={c.name}>
                  {c.name}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusToggle
                    checked={c.isActive}
                    ariaLabel={activeLabel}
                    onToggle={(next) => onToggleActive(c.id, next)}
                  />
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon-sm" onClick={() => onView(c)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onEdit(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onDelete(c.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </SortableItem>
        ))}
      </div>
    </SortableContainer>
  );
}

function TableView({
  items,
  onReorder,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  activeLabel,
  emptyMessage,
  t,
}: ListProps & { t: (k: string) => string }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead className="w-16">{t("common.logo")}</TableHead>
            <TableHead>{t("common.name")}</TableHead>
            <TableHead className="w-20">{t("common.active")}</TableHead>
            <TableHead className="w-24 text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <SortableContainer items={items.map((c) => c.id)} onReorder={onReorder}>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {items.map((c) => (
              <SortableItem key={c.id} id={c.id}>
                {({ ref, style, handleProps }) => (
                  <TableRow ref={ref} style={style}>
                    <TableCell>
                      <DragHandle handleProps={handleProps} size="sm" />
                    </TableCell>
                    <TableCell>
                      <ImagePreview src={c.logoUrl} alt={c.name} invertOnDark={c.invertOnDark} />
                    </TableCell>
                    <TableCell className="max-w-xs font-medium">
                      <span className="block truncate" title={c.name}>
                        {c.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusToggle
                        checked={c.isActive}
                        ariaLabel={activeLabel}
                        onToggle={(next) => onToggleActive(c.id, next)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => onView(c)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => onDelete(c.id)}>
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
  );
}

function CustomerDialog({
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
    const result = await upsertCustomer(values);
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else toast.error(result.error);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial.id ? t("edit") : t("add")} {t("nouns.customer")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-name">{t("common.name")}</Label>
            <Input id="c-name" {...register("name")} />
          </div>
          <div className="space-y-2">
            <Label>{t("common.logo")}</Label>
            <MediaUpload
              value={watch("logoUrl")}
              onChange={(url) => setValue("logoUrl", url, { shouldDirty: true })}
              accept="image"
              folder="customers"
              hint={t("hints.customerLogo")}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Switch
                id="c-invert"
                checked={watch("invertOnDark")}
                onCheckedChange={(v) => setValue("invertOnDark", v, { shouldDirty: true })}
              />
              <Label htmlFor="c-invert">{t("fields.invertOnDark")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="c-active"
                checked={watch("isActive")}
                onCheckedChange={(v) => setValue("isActive", v, { shouldDirty: true })}
              />
              <Label htmlFor="c-active">{t("fields.active")}</Label>
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
