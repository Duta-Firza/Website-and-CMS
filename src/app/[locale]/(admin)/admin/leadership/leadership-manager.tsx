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
import { StatusToggle } from "@/components/admin/status-toggle";
import { UrlTabs } from "@/components/admin/url-tabs";
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
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deleteLeadershipMember,
  reorderLeadership,
  toggleLeadershipActive,
  upsertLeadershipMember,
} from "@/lib/cms/actions";
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
  const tAbout = useTranslations("About");
  const locale = useLocale();
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [viewing, setViewing] = useState<LeadershipRow | null>(null);
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

  const handleToggleActive = async (id: string, next: boolean) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isActive: next } : x)));
    const result = await toggleLeadershipActive(id, next);
    if (!result.ok) {
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isActive: !next } : x)));
      throw new Error(result.error);
    }
    router.refresh();
  };

  return (
    <>
      <UrlTabs defaultTab="director" validValues={LEADERSHIP_TYPES} className="w-full">
        <TabsList className="grid grid-cols-2 md:w-fit md:grid-cols-2">
          <TabsTrigger value="director">{tAbout("boardOfDirectors")}</TabsTrigger>
          <TabsTrigger value="commissioner">{tAbout("boardOfCommissioners")}</TabsTrigger>
        </TabsList>
        <TabsContent value="director" className="mt-6">
          <MemberTable
            emptyMessage={t("empty.directors")}
            members={directors}
            onAdd={() => setEditing({ ...empty, type: "director", order: directors.length + 1 })}
            onView={(m) => setViewing(m)}
            onEdit={(m) => setEditing({ ...m })}
            onDelete={(id) => setDeleteId(id)}
            onReorder={handleReorder("director")}
            onToggleActive={handleToggleActive}
            addLabel={t("add")}
            activeLabel={t("common.active")}
            locale={locale}
          />
        </TabsContent>
        <TabsContent value="commissioner" className="mt-6">
          <MemberTable
            emptyMessage={t("empty.commissioners")}
            members={commissioners}
            onAdd={() =>
              setEditing({ ...empty, type: "commissioner", order: commissioners.length + 1 })
            }
            onView={(m) => setViewing(m)}
            onEdit={(m) => setEditing({ ...m })}
            onDelete={(id) => setDeleteId(id)}
            onReorder={handleReorder("commissioner")}
            onToggleActive={handleToggleActive}
            addLabel={t("add")}
            activeLabel={t("common.active")}
            locale={locale}
          />
        </TabsContent>
      </UrlTabs>

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

      <DetailDialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? ""}
        fields={
          viewing
            ? [
                { label: t("common.photo"), value: viewing.photoUrl, type: "image" },
                { label: t("common.name"), value: viewing.name },
                {
                  label: t("fields.titlePosition"),
                  value: viewing.title,
                  type: "localized",
                },
                { label: t("common.bio"), value: viewing.bio, type: "localizedLongtext" },
                { label: t("common.type"), value: t(`nouns.${viewing.type}`) },
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
  emptyMessage,
  members,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onReorder,
  onToggleActive,
  addLabel,
  activeLabel,
  locale,
}: {
  emptyMessage: string;
  members: LeadershipRow[];
  onAdd: () => void;
  onView: (m: LeadershipRow) => void;
  onEdit: (m: LeadershipRow) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onToggleActive: (id: string, next: boolean) => Promise<void>;
  addLabel: string;
  activeLabel: string;
  locale: string;
}) {
  const tCol = useTranslations("Admin.common");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
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
              <TableHead className="w-16">{tCol("photo")}</TableHead>
              <TableHead>{tCol("name")}</TableHead>
              <TableHead className="hidden md:table-cell">{tCol("title")}</TableHead>
              <TableHead className="w-16">{tCol("active")}</TableHead>
              <TableHead className="w-24 text-right">{tCol("actions")}</TableHead>
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
                        <StatusToggle
                          checked={m.isActive}
                          ariaLabel={activeLabel}
                          onToggle={(next) => onToggleActive(m.id, next)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => onView(m)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
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
          <DialogTitle>
            {initial.id ? t("edit") : t("add")} {t(`nouns.${initial.type}`)}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lm-name">{t("common.name")}</Label>
            <Input id="lm-name" {...register("name")} placeholder={t("fields.fullName")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <LocalizedField label={t("fields.titlePosition")} name="title" form={form} />
          <LocalizedField label={t("common.bio")} name="bio" form={form} multiline />
          <div className="space-y-2">
            <Label>{t("common.photo")}</Label>
            <MediaUpload
              value={watch("photoUrl")}
              onChange={(url) => setValue("photoUrl", url, { shouldDirty: true })}
              accept="image"
              folder="leadership"
              aspectRatio={4 / 5}
              hint={t("hints.leadershipPhoto")}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="lm-active"
              checked={watch("isActive")}
              onCheckedChange={(v) => setValue("isActive", v, { shouldDirty: true })}
            />
            <Label htmlFor="lm-active">{t("fields.active")}</Label>
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
