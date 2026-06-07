"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { MediaUpload } from "@/components/admin/media-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateSolutionPage } from "@/lib/cms/actions";
import type { SolutionPageSlug, SolutionPageStatus } from "@/models/constants";
import { StatusGroup } from "./status-group";

const localized = z.object({ id: z.string(), en: z.string() });

const schema = z.object({
  status: z.enum(["published", "comingSoon", "hidden"]),
  hero: z.object({
    eyebrow: localized,
    title: localized,
    subtitle: localized,
    backgroundImage: z.string(),
  }),
  body: z.object({
    heading: localized,
    content: localized,
  }),
  inquiryFormEnabled: z.boolean(),
  comingSoonMessage: localized,
});

export type SolutionPageFormValues = z.infer<typeof schema>;

interface Props {
  slug: SolutionPageSlug;
  initial: SolutionPageFormValues;
  /** Some pages (partners, products, epc) don't have an inquiry form — hide the toggle. */
  showInquiryToggle?: boolean;
}

export function SolutionPageForm({ slug, initial, showInquiryToggle = false }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const form = useForm<SolutionPageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: SolutionPageFormValues) => {
    const result = await updateSolutionPage(slug, values);
    if (result.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const status = watch("status") as SolutionPageStatus;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-end">
        <Button type="submit" variant="brand" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("groups.pageVisibility")}</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusGroup
            value={status}
            onChange={(next) => setValue("status", next, { shouldDirty: true })}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            {t("helpers.solutionsPageStatusHint")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("groups.pageHero")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocalizedField label={t("fields.heroEyebrow")} name="hero.eyebrow" form={form} />
          <LocalizedField label={t("fields.heroTitle")} name="hero.title" form={form} />
          <LocalizedField
            label={t("fields.heroSubtitle")}
            name="hero.subtitle"
            form={form}
            multiline
          />
          <div className="space-y-2">
            <Label>{t("fields.heroBgImage")}</Label>
            <MediaUpload
              value={watch("hero.backgroundImage")}
              onChange={(url) => setValue("hero.backgroundImage", url, { shouldDirty: true })}
              accept="image"
              folder={`solutions/${slug}`}
              hint={t("hints.heroBg")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("groups.pageBody")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocalizedField label={t("fields.bodyHeading")} name="body.heading" form={form} />
          <LocalizedField
            label={t("fields.bodyContent")}
            name="body.content"
            form={form}
            multiline
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("groups.comingSoonContent")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LocalizedField
            label={t("fields.comingSoonMessage")}
            name="comingSoonMessage"
            form={form}
            multiline
          />
        </CardContent>
      </Card>

      {showInquiryToggle && (
        <Card>
          <CardHeader>
            <CardTitle>{t("groups.formSettings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Switch
                id="inquiry-enabled"
                checked={watch("inquiryFormEnabled")}
                onCheckedChange={(v) => setValue("inquiryFormEnabled", v, { shouldDirty: true })}
              />
              <Label htmlFor="inquiry-enabled">{t("fields.inquiryFormEnabled")}</Label>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="brand" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
