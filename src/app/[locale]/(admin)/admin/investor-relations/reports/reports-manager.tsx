"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, FileText, ImageIcon, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
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
import { deleteReport, generateReportThumbnail, upsertReport } from "@/lib/cms/actions";
import { REPORT_THUMBNAIL_MODES, type ReportThumbnailMode } from "@/models/constants";
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
  thumbnailMode: z.enum(REPORT_THUMBNAIL_MODES),
  thumbnailUrl: z.string(),
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
    thumbnailMode: "default",
    thumbnailUrl: "",
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
    thumbnailMode: r.thumbnailMode,
    thumbnailUrl: r.thumbnailUrl,
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
      <DialogContent className="h-[90vh] p-0 sm:max-w-[90vw]">
        <iframe src={`${fileUrl}#toolbar=0`} className="h-full w-full rounded-lg" title={title} />
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
  const thumbnailMode = watch("thumbnailMode");
  const thumbnailUrl = watch("thumbnailUrl");
  const fileUrl = watch("fileUrl");
  const [generating, setGenerating] = useState(false);

  const { field: fileUrlField } = useController({ control, name: "fileUrl" });
  const { field: thumbnailUrlField } = useController({ control, name: "thumbnailUrl" });

  const changeThumbnailMode = (mode: ReportThumbnailMode) => {
    setValue("thumbnailMode", mode);
    // Switching to "default" clears any previously chosen image.
    if (mode === "default") setValue("thumbnailUrl", "");
  };

  const onGenerateThumbnail = async () => {
    if (!fileUrl) return;
    setGenerating(true);
    const result = await generateReportThumbnail(fileUrl);
    setGenerating(false);
    if (result.ok && result.data) {
      setValue("thumbnailUrl", result.data.url);
      toast.success(t("saved"));
    } else {
      toast.error(result.ok ? t("reportThumbnail.generateFailed") : result.error);
    }
  };

  const previewSrc = thumbnailMode !== "default" && thumbnailUrl ? thumbnailUrl : "";

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
      <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden sm:max-w-5xl">
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
            {errors.fileUrl && <p className="text-xs text-destructive">{errors.fileUrl.message}</p>}
          </div>

          {/* Thumbnail */}
          <div className="space-y-3 rounded-md border bg-muted/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>{t("reportThumbnail.label")}</Label>
              <Select
                value={thumbnailMode}
                onValueChange={(v) => changeThumbnailMode(v as ReportThumbnailMode)}
              >
                <SelectTrigger className="h-9 w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_THUMBNAIL_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {t(`reportThumbnail.mode_${m}` as never)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-md border bg-muted">
                {previewSrc ? (
                  <Image
                    src={previewSrc}
                    alt={t("reportThumbnail.label")}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground/40">
                    <FileText className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                {thumbnailMode === "upload" && (
                  <MediaUpload
                    accept="image"
                    folder="reports/thumbnails"
                    value={thumbnailUrlField.value}
                    onChange={thumbnailUrlField.onChange}
                    aspectRatio={16 / 9}
                  />
                )}
                {thumbnailMode === "pdfFirstPage" && (
                  <div className="space-y-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!fileUrl || generating}
                      onClick={onGenerateThumbnail}
                    >
                      {generating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="mr-2 h-4 w-4" />
                      )}
                      {t("reportThumbnail.generate")}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {fileUrl ? t("reportThumbnail.generateHint") : t("reportThumbnail.needPdf")}
                    </p>
                  </div>
                )}
                {thumbnailMode === "default" && (
                  <p className="text-xs text-muted-foreground">
                    {t("reportThumbnail.defaultHint")}
                  </p>
                )}
              </div>
            </div>
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

export function ReportsManager({ type, initial }: { type: ReportType; initial: ReportRow[] }) {
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
