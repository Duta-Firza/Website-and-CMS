"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAboutPage } from "@/lib/cms/actions";
import type { AboutFormValues } from "./page";

const localized = z.object({ id: z.string(), en: z.string() });

const schema = z.object({
  intro: localized,
  videoUrl: z.string(),
  vision: localized,
  mission: localized,
  values: z.array(
    z.object({
      title: localized,
      description: localized,
    }),
  ),
  coreBusinessTitle: localized,
  coreBusinessDescription: localized,
  affiliatedBusinessTitle: localized,
  affiliatedBusinessDescription: localized,
});

type FormValues = z.infer<typeof schema>;

export function AboutForm({ initial }: { initial: AboutFormValues }) {
  const t = useTranslations("Admin");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "values" });

  const onSubmit = async (values: FormValues) => {
    const result = await updateAboutPage(values);
    if (result.ok) toast.success(t("saved"));
    else toast.error(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-5 pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Who We Are
          </h3>
          <LocalizedField label="Intro paragraph" name="intro" form={form} multiline />
          <div className="space-y-2">
            <Label htmlFor="ab-video">Video Profile URL</Label>
            <Input
              id="ab-video"
              {...register("videoUrl")}
              placeholder="https://… /videos/profile.mp4"
            />
          </div>
          <LocalizedField label="Vision" name="vision" form={form} multiline />
          <LocalizedField label="Mission" name="mission" form={form} multiline />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Company Values
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: { id: "", en: "" }, description: { id: "", en: "" } })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add value
            </Button>
          </div>
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No values yet. Add one to display on the Who We Are page.
            </p>
          )}
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-3 rounded-md border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Value #{index + 1}
                </p>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <LocalizedField label="Title" name={`values.${index}.title`} form={form} />
              <LocalizedField
                label="Description"
                name={`values.${index}.description`}
                form={form}
                multiline
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Our Business (intro text for /about/business)
          </h3>
          <LocalizedField
            label="Core Business heading"
            name="coreBusinessTitle"
            form={form}
            placeholder={{ id: "Bisnis Inti", en: "Core Business" }}
          />
          <LocalizedField
            label="Core Business description"
            name="coreBusinessDescription"
            form={form}
            multiline
          />
          <LocalizedField
            label="Affiliated Business heading"
            name="affiliatedBusinessTitle"
            form={form}
            placeholder={{ id: "Bisnis Afiliasi", en: "Affiliated Business" }}
          />
          <LocalizedField
            label="Affiliated Business description"
            name="affiliatedBusinessDescription"
            form={form}
            multiline
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
