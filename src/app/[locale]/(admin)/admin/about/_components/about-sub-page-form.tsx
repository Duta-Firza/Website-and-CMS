"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateAboutSubPage } from "@/lib/cms/actions";
import {
  ABOUT_SUB_PAGE_STATUSES,
  type AboutSubPageSlug,
  type AboutSubPageStatus,
} from "@/models/constants";
import { StatusGroup } from "../../solutions/_components/status-group";

const localized = z.object({ id: z.string(), en: z.string() });

const schema = z.object({
  status: z.enum(ABOUT_SUB_PAGE_STATUSES),
  hero: z.object({
    eyebrow: localized,
    title: localized,
    subtitle: localized,
  }),
  body: z.object({
    heading: localized,
    content: localized,
  }),
});

export type AboutSubPageFormValues = z.infer<typeof schema>;

interface Props {
  slug: AboutSubPageSlug;
  initial: AboutSubPageFormValues;
}

export function AboutSubPageForm({ slug, initial }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();

  const form = useForm<AboutSubPageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: AboutSubPageFormValues) => {
    const result = await updateAboutSubPage(slug, values);
    if (result.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const status = watch("status") as AboutSubPageStatus;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("groups.pageVisibility")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusGroup
              value={status}
              onChange={(next) => setValue("status", next, { shouldDirty: true })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("groups.pageTitle")}</CardTitle>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("groups.pageBody")}</CardTitle>
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
      </div>

      <StickyFormBar>
        <Button type="submit" variant="brand" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </StickyFormBar>
    </form>
  );
}
