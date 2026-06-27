"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

function buildSchema(fields: LocalizedFormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    let s: z.ZodString = z.string();
    if (f.type === "email") s = s.email();
    s = s.max(f.type === "textarea" ? 4000 : 200);
    shape[f.key] = f.required ? s.min(1) : s.optional().default("");
  }
  return z.object(shape) as z.ZodType<Record<string, string>>;
}

export function InquiryForm({ source, fields, submitLabel, successMessage }: Props) {
  const t = useTranslations("InquiryForm");
  const [successOpen, setSuccessOpen] = useState(false);

  const schema = useMemo(() => buildSchema(fields), [fields]);
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

function FieldRow({
  field,
  register,
  setValue,
  watch,
  error,
}: {
  field: LocalizedFormField;
  register: ReturnType<typeof useForm<Record<string, string>>>["register"];
  setValue: ReturnType<typeof useForm<Record<string, string>>>["setValue"];
  watch: ReturnType<typeof useForm<Record<string, string>>>["watch"];
  error?: string;
}) {
  const id = `iq-${field.key}`;
  if (field.type === "select") {
    const current = watch(field.key) ?? "";
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>
          {field.label}
          {field.required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        <Select
          value={current}
          onValueChange={(v) => setValue(field.key, v ?? "", { shouldValidate: true })}
        >
          <SelectTrigger id={id} aria-invalid={Boolean(error)}>
            <SelectValue placeholder={field.placeholder}>
              {field.options.find((o) => o.value === current)?.label ?? field.placeholder}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {field.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={field.type === "number" ? "number" : field.type === "tel" ? "tel" : field.type === "email" ? "email" : "text"}
        placeholder={field.placeholder}
        aria-invalid={Boolean(error)}
        {...register(field.key)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
