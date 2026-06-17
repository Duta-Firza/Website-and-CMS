"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useController, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { MediaUpload } from "@/components/admin/media-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { upsertPublication } from "@/lib/cms/actions";
import type { PublicationCategory } from "@/models/publication";

const localized = z.object({ id: z.string(), en: z.string() });

export const publicationFormSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  category: z.enum(["newsroom", "press-release"]),
  title: localized,
  summary: localized,
  body: localized,
  imageUrl: z.string(),
  originalUrl: z.string(),
  publishedAt: z.string().min(1),
  isPublished: z.boolean(),
  order: z.number().int(),
});

export type PublicationFormValues = z.infer<typeof publicationFormSchema>;

function LocalizedRichField({
  label,
  nameId,
  nameEn,
  form,
}: {
  label: string;
  nameId: string;
  nameEn: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}) {
  const t = useTranslations("Admin");
  const controllerId = useController({ control: form.control, name: nameId });
  const controllerEn = useController({ control: form.control, name: nameEn });

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">{t("common.title")} — ID</Label>
        <RichTextEditor
          value={controllerId.field.value ?? ""}
          onChange={controllerId.field.onChange}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">{t("common.title")} — EN</Label>
        <RichTextEditor
          value={controllerEn.field.value ?? ""}
          onChange={controllerEn.field.onChange}
        />
      </div>
    </div>
  );
}

interface Props {
  category: PublicationCategory;
  initial: PublicationFormValues;
  backHref: string;
}

export function PublicationForm({ category, initial, backHref }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();

  const form = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationFormSchema),
    defaultValues: { ...initial, category },
  });
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = form;

  const isPublished = watch("isPublished");
  const slug = watch("slug") ?? "";
  const titleEn = watch("title.en");

  const { field: imageUrlField } = useController({ control, name: "imageUrl" });

  const onSubmit = async (values: PublicationFormValues) => {
    const result = await upsertPublication({
      ...values,
      publishedAt: new Date(values.publishedAt),
    });
    if (result.ok) {
      toast.success(t("saved"));
      router.push(backHref);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Article section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("groups.publicationItem")}</CardTitle>
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
              <div className="space-y-2">
                <Label>{t("fields.slug")}</Label>
                <Input {...register("slug")} placeholder={t("hints.slugHint")} />
                <p className="text-xs text-muted-foreground">
                  {slug ||
                    (titleEn
                      ? `→ auto: ${titleEn
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, "")
                          .trim()
                          .replace(/\s+/g, "-")
                          .slice(0, 80)}`
                      : t("hints.slugHint"))}
                </p>
              </div>
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
              <div className="space-y-2">
                <Label>{t("common.image")}</Label>
                <MediaUpload
                  accept="image"
                  folder="publications"
                  value={imageUrlField.value}
                  onChange={imageUrlField.onChange}
                  aspectRatio={16 / 9}
                />
              </div>
            </CardContent>
          </Card>

          {/* Article Body */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("fields.bodyRich")}</CardTitle>
            </CardHeader>
            <CardContent>
              <LocalizedRichField
                label={t("fields.bodyRich")}
                nameId="body.id"
                nameEn="body.en"
                form={form}
              />
              <p className="mt-2 text-xs text-muted-foreground">{t("hints.bodyRichHint")}</p>
            </CardContent>
          </Card>

          {/* Page Visibility — below Article Body */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("groups.pageVisibility")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={isPublished}
                  onCheckedChange={(v) => setValue("isPublished", v)}
                  id="pub-published"
                />
                <Label htmlFor="pub-published">{t("fields.published")}</Label>
              </div>
              <div className="space-y-2">
                <Label>{t("fields.publishedAt")}</Label>
                <Input type="date" {...register("publishedAt")} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("fields.originalUrl")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label>{t("fields.originalUrl")}</Label>
              <Input {...register("originalUrl")} placeholder="https://..." />
              <p className="text-xs text-muted-foreground">{t("hints.originalUrlHint")}</p>
            </CardContent>
          </Card>
        </div>
      </div>

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
