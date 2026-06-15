"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
import { LocalizedField } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FORM_FIELD_TYPES, type FormFieldType, isSystemKey } from "@/lib/cms/form-fields";
import type { SolutionPageFormValues } from "./solution-page-form";

interface Props {
  form: UseFormReturn<SolutionPageFormValues>;
}

export function FormBuilderSection({ form }: Props) {
  const t = useTranslations("Admin");
  const { register, watch, setValue, control } = form;
  const enabled = watch("formSettings.enabled");

  const {
    fields: rows,
    append,
    remove,
    move,
  } = useFieldArray({ control, name: "formSettings.fields" });

  const addField = () => {
    const next = rows.length + 1;
    append({
      key: `customField${next}`,
      label: { id: "Field baru", en: "New field" },
      placeholder: { id: "", en: "" },
      type: "text",
      required: false,
      order: next,
      options: [],
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("formBuilder.globalSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="fs-enabled"
              checked={enabled}
              onCheckedChange={(v) => {
                setValue("formSettings.enabled", v, { shouldDirty: true });
                setValue("inquiryFormEnabled", v, { shouldDirty: true });
              }}
            />
            <Label htmlFor="fs-enabled">{t("fields.inquiryFormEnabled")}</Label>
          </div>
          <LocalizedField
            label={t("formBuilder.submitLabel")}
            name="formSettings.submitLabel"
            form={form}
          />
          <LocalizedField
            label={t("formBuilder.successMessage")}
            name="formSettings.successMessage"
            form={form}
            multiline
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            {t("formBuilder.fields")} · {rows.length}
          </CardTitle>
          <Button type="button" size="sm" onClick={addField}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            {t("formBuilder.addField")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 && (
            <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
              {t("formBuilder.empty")}
            </p>
          )}
          {rows.map((row, index) => {
            const fieldKey = watch(`formSettings.fields.${index}.key`);
            const fieldType = watch(`formSettings.fields.${index}.type`) as FormFieldType;
            const isSystem = isSystemKey(fieldKey);
            return (
              <div key={row.id} className="space-y-3 rounded-md border bg-card p-3">
                <div className="flex items-start gap-2">
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => index > 0 && move(index, index - 1)}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      title={t("formBuilder.moveUp")}
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid flex-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {t("formBuilder.key")}
                        {isSystem && (
                          <span className="ml-1 text-[9px] font-normal normal-case text-brand-accent">
                            ({t("formBuilder.system")})
                          </span>
                        )}
                      </Label>
                      <Input
                        {...register(`formSettings.fields.${index}.key`)}
                        readOnly={isSystem}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {t("formBuilder.type")}
                      </Label>
                      <Select
                        value={fieldType}
                        onValueChange={(v) =>
                          setValue(`formSettings.fields.${index}.type`, v as FormFieldType, {
                            shouldDirty: true,
                          })
                        }
                        disabled={isSystem}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FORM_FIELD_TYPES.map((tp) => (
                            <SelectItem key={tp} value={tp}>
                              {tp}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2 pb-1">
                      <Switch
                        id={`fs-req-${index}`}
                        checked={watch(`formSettings.fields.${index}.required`)}
                        onCheckedChange={(v) =>
                          setValue(`formSettings.fields.${index}.required`, v, {
                            shouldDirty: true,
                          })
                        }
                      />
                      <Label htmlFor={`fs-req-${index}`} className="text-xs">
                        {t("formBuilder.required")}
                      </Label>
                    </div>
                  </div>
                  {!isSystem && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
                <LocalizedField
                  label={t("formBuilder.label")}
                  name={`formSettings.fields.${index}.label`}
                  form={form}
                />
                <LocalizedField
                  label={t("formBuilder.placeholder")}
                  name={`formSettings.fields.${index}.placeholder`}
                  form={form}
                />
                {fieldType === "select" && <OptionsEditor form={form} fieldIndex={index} />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function OptionsEditor({
  form,
  fieldIndex,
}: {
  form: UseFormReturn<SolutionPageFormValues>;
  fieldIndex: number;
}) {
  const t = useTranslations("Admin");
  const { register, watch, setValue, control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `formSettings.fields.${fieldIndex}.options`,
  });
  return (
    <div className="space-y-2 rounded-md border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {t("formBuilder.options")}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ value: `option${fields.length + 1}`, label: { id: "", en: "" } })}
        >
          <Plus className="mr-1 h-3 w-3" />
          {t("formBuilder.addOption")}
        </Button>
      </div>
      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground">{t("formBuilder.noOptions")}</p>
      )}
      {fields.map((opt, oi) => (
        <div key={opt.id} className="grid grid-cols-[1fr_2fr_2fr_auto] items-center gap-2">
          <Input
            {...register(`formSettings.fields.${fieldIndex}.options.${oi}.value`)}
            placeholder="value"
            className="font-mono text-xs"
          />
          <Input
            value={watch(`formSettings.fields.${fieldIndex}.options.${oi}.label.id`) ?? ""}
            onChange={(e) =>
              setValue(`formSettings.fields.${fieldIndex}.options.${oi}.label.id`, e.target.value, {
                shouldDirty: true,
              })
            }
            placeholder="Label ID"
          />
          <Input
            value={watch(`formSettings.fields.${fieldIndex}.options.${oi}.label.en`) ?? ""}
            onChange={(e) =>
              setValue(`formSettings.fields.${fieldIndex}.options.${oi}.label.en`, e.target.value, {
                shouldDirty: true,
              })
            }
            placeholder="Label EN"
          />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(oi)}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
