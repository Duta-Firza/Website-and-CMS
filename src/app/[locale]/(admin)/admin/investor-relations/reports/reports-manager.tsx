"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { pickLocalized } from "@/components/admin/localized-text";
import { MediaUpload } from "@/components/admin/media-upload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { deleteReport, upsertReport } from "@/lib/cms/actions";
import type { ReportType } from "@/models/report";
import type { ReportRow } from "./page";

const localized = z.object({ id: z.string(), en: z.string() });

const schema = z.object({
  id: z.string().optional(),
  title: localized,
  type: z.enum(["annual", "financial"]),
  year: z.number().int().min(2000).max(2100),
  description: localized,
  fileUrl: z.string().min(1, "PDF file is required"),
  publishedAt: z.string().min(1, "Published date is required"),
  isPublished: z.boolean(),
  order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

function makeEmptyReport(type: ReportType): FormValues {
  return {
    title: { id: "", en: "" },
    type,
    year: new Date().getFullYear(),
    description: { id: "", en: "" },
    fileUrl: "",
    publishedAt: new Date().toISOString().split("T")[0],
    isPublished: true,
    order: 0,
  };
}

function toFormValues(r: ReportRow): FormValues {
  return {
    id: r.id,
    title: r.title,
    type: r.type,
    year: r.year,
    description: r.description,
    fileUrl: r.fileUrl,
    publishedAt: r.publishedAt.toISOString().split("T")[0],
    isPublished: r.isPublished,
    order: r.order,
  };
}

interface ReportPreviewDialogProps {
  fileUrl: string;
  title: string;
  open: boolean;
  onClose: () => void;
}

function ReportPreviewDialog({ fileUrl, title, open, onClose }: ReportPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="h-[90vh] max-w-5xl p-0">
        <iframe
          src={`${fileUrl}#toolbar=0`}
          className="h-full w-full rounded-lg"
          title={title}
        />
      </DialogContent>
    </Dialog>
  );
}

function ReportFormDialog({
  initial,
  typeLabel,
  onClose,
  onSaved,
}: {
  initial: FormValues;
  typeLabel: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("Admin");
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial });
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = form;

  const yearValue = watch("year");
  const isPublished = watch("isPublished");

  const { field: fileUrlField } = useController({ control, name: "fileUrl" });

  const onSubmit = async (values: FormValues) => {
    const result = await upsertReport({
      ...values,
      publishedAt: new Date(values.publishedAt),
    });
    if (result.ok) {
      toast.success(t("saved"));
      onSaved();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial.id ? t("edit") : t("add")} {t("groups.reportItem")} — {typeLabel}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <LocalizedField label={t("common.title")} name="title" form={form} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("fields.reportYear")}</Label>
              <Input
                type="number"
                value={yearValue}
                onChange={(e) =>
                  setValue("year", parseInt(e.target.value, 10) || new Date().getFullYear())
                }
              />
              {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("fields.publishedAt")}</Label>
              <Input type="date" {...register("publishedAt")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("fields.fileUrl")}</Label>
            <MediaUpload
              accept="pdf"
              folder="reports"
              value={fileUrlField.value}
              onChange={fileUrlField.onChange}
            />
            {errors.fileUrl && (
              <p className="text-xs text-destructive">{errors.fileUrl.message}</p>
            )}
          </div>
          <LocalizedField
            label={`${t("common.description")} (${t("optional")})`}
            name="description"
            form={form}
            multiline
          />
          <div className="flex items-center gap-3">
            <Switch
              checked={isPublished}
              onCheckedChange={(v) => setValue("isPublished", v)}
              id="report-published"
            />
            <Label htmlFor="report-published">{t("fields.published")}</Label>
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

function ReportTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: ReportRow[];
  onEdit: (r: ReportRow) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("Admin");
  const tIR = useTranslations("IR");
  const locale = useLocale();
  const [previewing, setPreviewing] = useState<ReportRow | null>(null);

  return (
    <>
      <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.title")}</TableHead>
              <TableHead className="w-20">{t("fields.reportYear")}</TableHead>
              <TableHead className="w-24">{t("common.published")}</TableHead>
              <TableHead className="w-32 text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  {t("empty.reports")}
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="truncate font-medium">{pickLocalized(r.title, locale)}</p>
                </TableCell>
                <TableCell>{r.year}</TableCell>
                <TableCell>
                  {r.isPublished ? (
                    <Badge variant="default" className="text-xs">
                      {t("status.published")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {t("status.hidden")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title={tIR("previewReport")}
                      onClick={() => setPreviewing(r)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onEdit(r)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onDelete(r.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {previewing && (
        <ReportPreviewDialog
          open
          fileUrl={previewing.fileUrl}
          title={pickLocalized(previewing.title, locale)}
          onClose={() => setPreviewing(null)}
        />
      )}
    </>
  );
}

export function ReportsManager({
  type,
  initial,
}: {
  type: ReportType;
  initial: ReportRow[];
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [editing, setEditing] = useState<FormValues | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const typeLabel = type === "annual" ? t("tabs.annual") : t("tabs.financial");

  return (
    <>
      <div className="flex items-center justify-end">
        <Button onClick={() => setEditing(makeEmptyReport(type))}>
          <Plus className="mr-2 h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      <ReportTable
        rows={initial}
        onEdit={(r) => setEditing(toFormValues(r))}
        onDelete={setDeleteId}
      />

      {editing && (
        <ReportFormDialog
          initial={editing}
          typeLabel={typeLabel}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
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
                const result = await deleteReport(deleteId);
                if (result.ok) {
                  toast.success(t("saved"));
                  setDeleteId(null);
                  router.refresh();
                } else {
                  toast.error(result.error);
                }
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
