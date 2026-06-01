"use client";

import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  label: ReactNode;
  /** Parent path like "title" — component appends `.id` / `.en` internally */
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: deliberately untyped so callers don't need to pass generics
  form: UseFormReturn<any>;
  multiline?: boolean;
  placeholder?: { id?: string; en?: string };
}

export function LocalizedField({ label, name, form, multiline = false, placeholder }: Props) {
  const Component = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="space-y-1">
          <Component
            placeholder={placeholder?.id ?? "Bahasa Indonesia"}
            aria-label={`${name} (ID)`}
            {...form.register(`${name}.id`)}
          />
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ID</p>
        </div>
        <div className="space-y-1">
          <Component
            placeholder={placeholder?.en ?? "English"}
            aria-label={`${name} (EN)`}
            {...form.register(`${name}.en`)}
          />
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">EN</p>
        </div>
      </div>
    </div>
  );
}
