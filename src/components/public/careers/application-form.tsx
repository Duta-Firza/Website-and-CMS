"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { buildFieldsSchema, FieldRow } from "@/components/public/dynamic-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitApplication } from "@/lib/cms/actions";
import type { LocalizedFormSettings } from "@/lib/cms/solutions";

const MAX_CV_SIZE = 10 * 1024 * 1024;

interface Props {
  jobOpeningId: string;
  jobTitle: string;
  form: LocalizedFormSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationDialog({ jobOpeningId, jobTitle, form: formSettings, open, onOpenChange }: Props) {
  const t = useTranslations("Careers");
  const [success, setSuccess] = useState(false);
  const [cv, setCv] = useState<{ url: string; name: string } | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const schema = useMemo(() => buildFieldsSchema(formSettings.fields), [formSettings.fields]);
  const defaultValues = useMemo(
    () => Object.fromEntries(formSettings.fields.map((f) => [f.key, ""])),
    [formSettings.fields],
  );

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(
      schema as unknown as z.ZodType<Record<string, string>, Record<string, string>>,
    ),
    defaultValues,
  });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = form;

  const onCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCvError(null);
    if (file.type !== "application/pdf") {
      setCvError(t("cvInvalid"));
      return;
    }
    if (file.size > MAX_CV_SIZE) {
      setCvError(t("cvTooLarge"));
      return;
    }
    setCvUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/careers/apply/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; filename?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || t("cvUploadFailed"));
      setCv({ url: data.url, name: data.filename ?? file.name });
    } catch (err) {
      setCvError(err instanceof Error ? err.message : t("cvUploadFailed"));
    } finally {
      setCvUploading(false);
    }
  };

  const onSubmit = async (values: Record<string, string>) => {
    if (!cv) {
      setCvError(t("cvRequired"));
      return;
    }
    const result = await submitApplication({
      jobOpeningId,
      values,
      cvUrl: cv.url,
      cvFileName: cv.name,
    });
    if (!result.ok) {
      toast.error(result.error || t("errorToast"));
      return;
    }
    reset();
    setCv(null);
    setSuccess(true);
  };

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      // Reset to a clean state for the next open.
      setTimeout(() => {
        setSuccess(false);
        setCvError(null);
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {success ? (
          <>
            <DialogHeader className="items-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <DialogTitle className="text-lg">{t("applySuccessTitle")}</DialogTitle>
              <DialogDescription className="text-center text-balance">
                {formSettings.successMessage || t("applySuccessMessage")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                variant="brand"
                size="lg"
                className="w-full sm:w-auto sm:min-w-32"
                onClick={() => close(false)}
              >
                {t("ok")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("applyFor", { title: jobTitle })}</DialogTitle>
              <DialogDescription>{t("applyDialogSubtitle")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {formSettings.fields
                  .filter((f) => f.type !== "textarea")
                  .map((f) => (
                    <FieldRow
                      key={f.key}
                      field={f}
                      register={register}
                      setValue={setValue}
                      watch={watch}
                      idPrefix="ap"
                      error={errors[f.key]?.message as string | undefined}
                    />
                  ))}
              </div>
              {formSettings.fields
                .filter((f) => f.type === "textarea")
                .map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <Label htmlFor={`ap-${f.key}`}>
                      {f.label}
                      {f.required && <span className="ml-0.5 text-destructive">*</span>}
                    </Label>
                    <Textarea
                      id={`ap-${f.key}`}
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

              {/* CV upload (required) */}
              <div className="space-y-1.5">
                <Label>
                  {t("cvLabel")}
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                {cv ? (
                  <div className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-brand-accent" />
                      <span className="truncate">{cv.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCv(null)}
                      aria-label={t("cvRemove")}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={cvUploading}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed bg-card px-3 py-4 text-sm text-muted-foreground transition hover:border-brand-accent/40 hover:text-foreground disabled:opacity-60"
                  >
                    {cvUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {cvUploading ? t("cvUploading") : t("cvUploadHint")}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={onCvChange}
                />
                {cvError && <p className="text-xs text-destructive">{cvError}</p>}
              </div>

              <Button
                type="submit"
                variant="brand"
                size="lg"
                disabled={isSubmitting || cvUploading}
                className="w-full"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? t("applySubmitting") : formSettings.submitLabel || t("applySubmit")}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
