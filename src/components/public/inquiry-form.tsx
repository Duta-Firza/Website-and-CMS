"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry } from "@/lib/cms/actions";
import type { LocalizedFormField } from "@/lib/cms/solutions";
import type { InquirySource } from "@/models/constants";

interface Props {
  source: InquirySource;
  fields: LocalizedFormField[];
  submitLabel: string;
  successMessage: string;
}

export function InquiryForm({ source, fields, submitLabel, successMessage }: Props) {
  const t = useTranslations("InquiryForm");
  const [successOpen, setSuccessOpen] = useState(false);

  const schema = useMemo(() => buildFieldsSchema(fields), [fields]);
  const defaultValues = useMemo(() => {
    return Object.fromEntries(fields.map((f) => [f.key, ""]));
  }, [fields]);

  const form = useForm<Record<string, string>>({
    // Schema is built at runtime from CMS-defined fields, so the resolver
    // generic ends up looser than useForm prefers — cast at the seam.
    resolver: zodResolver(schema as unknown as z.ZodType<Record<string, string>, Record<string, string>>),
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

  const onSubmit = async (values: Record<string, string>) => {
    const result = await submitInquiry({ source, values });
    if (!result.ok) {
      toast.error(result.error || t("errorToast"));
      return;
    }
    reset();
    // Success confirmation is shown as a centered modal (rather than a toast)
    // so users clearly notice the submission went through.
    setSuccessOpen(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            />
          ))}
      </div>
      {fields
        .filter((f) => f.type === "textarea")
        .map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`iq-${f.key}`}>
              {f.label}
              {f.required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            <Textarea
              id={`iq-${f.key}`}
              rows={5}
              placeholder={f.placeholder}
              aria-invalid={Boolean(errors[f.key])}
              {...register(f.key)}
            />
            {errors[f.key] && (
              <p className="text-xs text-destructive">{errors[f.key]?.message as string}</p>
            )}
          </div>
        ))}
      <Button
        type="submit"
        variant="brand"
        size="lg"
        disabled={isSubmitting}
        className="w-full md:w-auto"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? t("submitting") : submitLabel}
      </Button>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader className="items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <DialogTitle className="text-lg">{t("successTitle")}</DialogTitle>
            <DialogDescription className="text-center text-balance">
              {successMessage || t("successToast")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="brand"
              size="lg"
              className="w-full sm:w-auto sm:min-w-32"
              onClick={() => setSuccessOpen(false)}
            >
              {t("ok")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
