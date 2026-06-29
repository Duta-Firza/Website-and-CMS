"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { buildFieldsSchema, FieldRow } from "@/components/public/dynamic-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReportLead } from "@/lib/cms/actions";
import type { LocalizedFormField, LocalizedFormSettings } from "@/lib/cms/solutions";

const LS_KEY = "df-report-lead";

function readLead(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

function writeLead(values: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(values));
  } catch {
    // ignore quota / private-mode errors
  }
}

type GateMode = "view" | "download";

interface Props {
  reportId: string;
  title: string;
  fileUrl: string;
  viewLabel: string;
  downloadLabel: string;
  formSettings: LocalizedFormSettings;
}

export function ReportDownloadActions({
  reportId,
  title,
  fileUrl,
  viewLabel,
  downloadLabel,
  formSettings,
}: Props) {
  const t = useTranslations("ReportGate");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mode, setMode] = useState<GateMode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const gated = formSettings.enabled && formSettings.fields.length > 0;

  const triggerDownload = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = "";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleView = () => {
    if (!gated) {
      setPreviewOpen(true);
      return;
    }
    const stored = readLead();
    if (stored) {
      // Already captured this visitor — record the view silently and open the
      // preview without re-prompting.
      void submitReportLead({ reportId, action: "view", values: stored });
      setPreviewOpen(true);
    } else {
      setMode("view");
    }
  };

  const handleDownload = () => {
    if (!gated) {
      triggerDownload();
      return;
    }
    // Downloads always show the form (pre-filled), capturing a lead each time.
    setMode("download");
  };

  const onSubmit = async (values: Record<string, string>) => {
    if (!mode) return;
    setSubmitting(true);
    const result = await submitReportLead({ reportId, action: mode, values });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error || t("errorToast"));
      return;
    }
    writeLead(values);
    setMode(null);
    if (formSettings.successMessage) toast.success(formSettings.successMessage);
    if (mode === "view") setPreviewOpen(true);
    else triggerDownload();
  };

  return (
    <>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={handleView}>
          {viewLabel}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDownload}>
          {downloadLabel}
        </Button>
      </div>

      {/* Lead capture form */}
      <Dialog open={mode !== null} onOpenChange={(open) => !open && setMode(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          {mode && (
            <LeadForm
              fields={formSettings.fields}
              submitLabel={formSettings.submitLabel}
              submitting={submitting}
              onSubmit={onSubmit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* PDF preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="h-[90vh] p-0 sm:max-w-[90vw]">
          <iframe src={`${fileUrl}#toolbar=0`} className="h-full w-full rounded-lg" title={title} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function LeadForm({
  fields,
  submitLabel,
  submitting,
  onSubmit,
}: {
  fields: LocalizedFormField[];
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
}) {
  const t = useTranslations("ReportGate");
  const schema = useMemo(() => buildFieldsSchema(fields), [fields]);
  const defaultValues = useMemo(() => {
    const stored = readLead() ?? {};
    return Object.fromEntries(fields.map((f) => [f.key, stored[f.key] ?? ""]));
  }, [fields]);

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(
      schema as unknown as z.ZodType<Record<string, string>, Record<string, string>>,
    ),
    defaultValues,
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields
          .filter((f) => f.type !== "textarea")
          .map((f) => (
            <FieldRow
              key={f.key}
              field={f}
              register={register}
              setValue={setValue}
              watch={watch}
              error={errors[f.key]?.message as string | undefined}
              idPrefix="rg"
            />
          ))}
      </div>
      {fields
        .filter((f) => f.type === "textarea")
        .map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`rg-${f.key}`}>
              {f.label}
              {f.required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            <Textarea
              id={`rg-${f.key}`}
              rows={4}
              placeholder={f.placeholder}
              aria-invalid={Boolean(errors[f.key])}
              {...register(f.key)}
            />
            {errors[f.key] && (
              <p className="text-xs text-destructive">{errors[f.key]?.message as string}</p>
            )}
          </div>
        ))}
      <Button type="submit" variant="brand" size="lg" disabled={submitting} className="w-full">
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitting ? t("submitting") : submitLabel}
      </Button>
    </form>
  );
}
