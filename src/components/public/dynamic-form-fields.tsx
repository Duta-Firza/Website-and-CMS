"use client";

import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LocalizedFormField } from "@/lib/cms/solutions";

/**
 * Build a runtime Zod schema from CMS-defined fields. Shared by the Solutions
 * inquiry form and the Investor-Relations report download gate.
 */
export function buildFieldsSchema(fields: LocalizedFormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    let s: z.ZodString = z.string();
    if (f.type === "email") s = s.email();
    s = s.max(f.type === "textarea" ? 4000 : 200);
    shape[f.key] = f.required ? s.min(1) : s.optional().default("");
  }
  return z.object(shape) as z.ZodType<Record<string, string>>;
}

type FormApi = UseFormReturn<Record<string, string>>;

/** Renders a single non-textarea field (text/email/tel/number/select). */
export function FieldRow({
  field,
  register,
  setValue,
  watch,
  error,
  idPrefix = "iq",
}: {
  field: LocalizedFormField;
  register: FormApi["register"];
  setValue: FormApi["setValue"];
  watch: FormApi["watch"];
  error?: string;
  idPrefix?: string;
}) {
  const id = `${idPrefix}-${field.key}`;
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
        type={
          field.type === "number"
            ? "number"
            : field.type === "tel"
              ? "tel"
              : field.type === "email"
                ? "email"
                : "text"
        }
        placeholder={field.placeholder}
        aria-invalid={Boolean(error)}
        {...register(field.key)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
