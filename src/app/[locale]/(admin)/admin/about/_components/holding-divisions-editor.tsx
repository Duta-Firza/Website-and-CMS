"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { DragHandle, SortableContainer, SortableItem } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAboutHolding } from "@/lib/cms/actions";

const localized = z.object({ id: z.string(), en: z.string() });
const divisionSchema = z.object({ key: z.string().min(1), label: localized });
const schema = z.object({
  holdingStructureLabel: localized,
  holdingGroupLabel: localized,
  holdingDivisions: z.array(divisionSchema),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  initial: FormValues;
}

export function HoldingDivisionsEditor({ initial }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = form;
  const { fields, append, remove, move } = useFieldArray({ control, name: "holdingDivisions" });

  const handleReorder = (newIds: string[]) => {
    const currentIds = fields.map((f) => f.id);
    for (let i = 0; i < newIds.length; i++) {
      const from = currentIds.indexOf(newIds[i]);
      if (from !== i && from >= 0) {
        move(from, i);
        currentIds.splice(i, 0, currentIds.splice(from, 1)[0]);
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    const result = await updateAboutHolding(values);
    if (result.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("groups.holdingLabels")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocalizedField
            label={t("fields.holdingStructureCaption")}
            name="holdingStructureLabel"
            form={form}
          />
          <LocalizedField
            label={t("fields.holdingGroupLabel")}
            name="holdingGroupLabel"
            form={form}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">{t("fields.holdingDivisions")}</CardTitle>
              <CardDescription className="mt-1">{t("fields.holdingDivisionsDesc")}</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ key: "", label: { id: "", en: "" } })}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("add")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SortableContainer items={fields.map((f) => f.id)} onReorder={handleReorder}>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <SortableItem key={field.id} id={field.id}>
                  {({ ref, style, handleProps }) => (
                    <div
                      ref={ref}
                      style={style}
                      className="space-y-3 rounded-md border bg-muted/30 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <DragHandle handleProps={handleProps} size="sm" />
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("credentials.divisionIndex", { index: index + 1 })}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("fields.divisionKey")}</Label>
                        <Input
                          {...register(`holdingDivisions.${index}.key`)}
                          placeholder="e.g. trading"
                        />
                        {errors.holdingDivisions?.[index]?.key && (
                          <p className="text-xs text-destructive">
                            {errors.holdingDivisions[index].key?.message}
                          </p>
                        )}
                      </div>
                      <LocalizedField
                        label={t("fields.divisionLabel")}
                        name={`holdingDivisions.${index}.label`}
                        form={form}
                      />
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContainer>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
