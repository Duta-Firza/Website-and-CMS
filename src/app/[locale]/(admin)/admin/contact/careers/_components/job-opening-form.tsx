"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useController, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
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
import { Textarea } from "@/components/ui/textarea";
import { upsertJobOpening } from "@/lib/cms/actions";
import { JOB_APPLY_MODES, JOB_EMPLOYMENT_TYPES } from "@/models/constants";

const localized = z.object({ id: z.string(), en: z.string() });

export const jobOpeningFormSchema = z.object({
  id: z.string().optional(),
  title: localized,
  department: z.string(),
  location: z.string(),
  employmentType: z.enum(JOB_EMPLOYMENT_TYPES),
  applyMode: z.enum(JOB_APPLY_MODES),
  applyUrl: z.string(),
  applyEmail: z.string(),
  summary: localized,
  description: localized,
  isPublished: z.boolean(),
  order: z.number().int(),
  postedAt: z.string().min(1),
});

export type JobOpeningFormValues = z.infer<typeof jobOpeningFormSchema>;

export function JobOpeningForm({
  initial,
  backHref,
}: {
  initial: JobOpeningFormValues;
  backHref: string;
}) {
  const t = useTranslations("Admin");
  const tc = useTranslations("Careers");
  const router = useRouter();

  const form = useForm<JobOpeningFormValues>({
    resolver: zodResolver(jobOpeningFormSchema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = form;

  const descId = useController({ control, name: "description.id" });
  const descEn = useController({ control, name: "description.en" });

  const onSubmit = async (values: JobOpeningFormValues) => {
    const result = await upsertJobOpening({ ...values, postedAt: new Date(values.postedAt) });
    if (result.ok) {
      toast.success(t("saved"));
      router.push(backHref);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("careerPage.jobItem")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("common.title")} — ID *</Label>
              <Input {...register("title.id")} />
              {errors.title?.id && (
                <p className="text-xs text-destructive">{errors.title.id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("common.title")} — EN *</Label>
              <Input {...register("title.en")} />
              {errors.title?.en && (
                <p className="text-xs text-destructive">{errors.title.en.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("careerPage.department")}</Label>
              <Input {...register("department")} />
            </div>
            <div className="space-y-2">
              <Label>{t("common.city")}</Label>
              <Input {...register("location")} />
            </div>
            <div className="space-y-2">
              <Label>{t("careerPage.employmentType")}</Label>
              <Select
                value={watch("employmentType")}
                onValueChange={(v) =>
                  setValue("employmentType", v as JobOpeningFormValues["employmentType"], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_EMPLOYMENT_TYPES.map((tp) => (
                    <SelectItem key={tp} value={tp}>
                      {tc(`empType.${tp}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("careerPage.applyMode")}</Label>
              <Select
                value={watch("applyMode")}
                onValueChange={(v) =>
                  setValue("applyMode", v as JobOpeningFormValues["applyMode"], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_APPLY_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {t(`careerPage.applyMode_${m}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {watch("applyMode") === "url" && (
              <div className="space-y-2">
                <Label>{t("careerPage.applyUrl")}</Label>
                <Input {...register("applyUrl")} placeholder="https://..." />
              </div>
            )}
            {watch("applyMode") === "email" && (
              <div className="space-y-2">
                <Label>{t("careerPage.applyEmail")}</Label>
                <Input {...register("applyEmail")} placeholder="hr@dutafirza.com" />
              </div>
            )}
          </div>
          {watch("applyMode") === "form" && (
            <p className="text-xs text-muted-foreground">{t("careerPage.applyModeFormHint")}</p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("fields.summary")} — ID</Label>
              <Textarea rows={3} {...register("summary.id")} />
            </div>
            <div className="space-y-2">
              <Label>{t("fields.summary")} — EN</Label>
              <Textarea rows={3} {...register("summary.en")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("careerPage.jobDescription")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              {t("careerPage.jobDescription")} — ID
            </Label>
            <RichTextEditor value={descId.field.value ?? ""} onChange={descId.field.onChange} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              {t("careerPage.jobDescription")} — EN
            </Label>
            <RichTextEditor value={descEn.field.value ?? ""} onChange={descEn.field.onChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("groups.pageVisibility")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={watch("isPublished")}
              onCheckedChange={(v) => setValue("isPublished", v)}
              id="job-published"
            />
            <Label htmlFor="job-published">{t("fields.published")}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t("fields.publishedAt")}</Label>
            <Input type="date" {...register("postedAt")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(backHref)}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
