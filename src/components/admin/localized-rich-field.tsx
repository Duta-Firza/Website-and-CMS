"use client";

import type { ReactNode } from "react";
import { type UseFormReturn, useController } from "react-hook-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Label } from "@/components/ui/label";

interface Props {
  label: ReactNode;
  /** Parent path like "body" — component appends `.id` / `.en` internally */
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: deliberately untyped so callers don't need to pass generics
  form: UseFormReturn<any>;
}

/** Rich-text twin of <LocalizedField> — one Tiptap editor per locale, storing HTML. */
export function LocalizedRichField({ label, name, form }: Props) {
  const controllerId = useController({ control: form.control, name: `${name}.id` });
  const controllerEn = useController({ control: form.control, name: `${name}.en` });

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-3">
        <div className="space-y-1">
          <RichTextEditor
            value={controllerId.field.value ?? ""}
            onChange={controllerId.field.onChange}
          />
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ID</p>
        </div>
        <div className="space-y-1">
          <RichTextEditor
            value={controllerEn.field.value ?? ""}
            onChange={controllerEn.field.onChange}
          />
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">EN</p>
        </div>
      </div>
    </div>
  );
}
