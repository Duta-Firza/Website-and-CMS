"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField, LocalizedFieldStatic } from "@/components/admin/localized-field";
import { SectionModeToggle } from "@/components/admin/section-mode-toggle";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateAboutSubPage } from "@/lib/cms/actions";
import {
  ABOUT_SUB_PAGE_STATUSES,
  type AboutSubPageSlug,
  type AboutSubPageStatus,
  SECTION_MODES,
  type SectionMode,
} from "@/models/constants";
import { StatusGroup } from "../../solutions/_components/status-group";

type LocalizedStr = { id: string; en: string };
const empty: LocalizedStr = { id: "", en: "" };

const HERO_DEFAULTS: Record<AboutSubPageSlug, { eyebrow: LocalizedStr; title: LocalizedStr; subtitle: LocalizedStr }> = {
  "who-we-are": {
    eyebrow: { id: "Tentang Kami", en: "About Us" },
    title: { id: "Tentang PT Duta Firza", en: "About PT Duta Firza" },
    subtitle: empty,
  },
  leadership: {
    eyebrow: { id: "Tentang Kami", en: "About Us" },
    title: { id: "Kepemimpinan", en: "Leadership" },
    subtitle: empty,
  },
  history: {
    eyebrow: { id: "Tentang Kami", en: "About Us" },
    title: { id: "Sejarah", en: "History" },
    subtitle: empty,
  },
  business: {
    eyebrow: { id: "Tentang Kami", en: "About Us" },
    title: { id: "Bisnis Kami", en: "Our Business" },
    subtitle: empty,
  },
  credentials: {
    eyebrow: { id: "Tentang Kami", en: "About Us" },
    title: { id: "Kredensial", en: "Credentials" },
    subtitle: empty,
  },
};

const BODY_DEFAULTS = { heading: empty, content: empty };

const localized = z.object({ id: z.string(), en: z.string() });

const schema = z.object({
  status: z.enum(ABOUT_SUB_PAGE_STATUSES),
  heroMode: z.enum(SECTION_MODES),
  bodyMode: z.enum(SECTION_MODES),
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
  const heroMode = watch("heroMode") as SectionMode;
  const bodyMode = watch("bodyMode") as SectionMode;
  const optional = t("optional");

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
            <SectionModeToggle
              value={heroMode}
              onChange={(next) => setValue("heroMode", next, { shouldDirty: true })}
            />
            {heroMode === "default" && (
              <div className="space-y-4 border-t pt-4">
                <LocalizedFieldStatic
                  label={`${t("fields.heroEyebrow")} (${optional})`}
                  value={HERO_DEFAULTS[slug].eyebrow}
                />
                <LocalizedFieldStatic
                  label={`${t("fields.heroTitle")} (${optional})`}
                  value={HERO_DEFAULTS[slug].title}
                />
                <LocalizedFieldStatic
                  label={`${t("fields.heroSubtitle")} (${optional})`}
                  value={HERO_DEFAULTS[slug].subtitle}
                  multiline
                />
              </div>
            )}
            {heroMode === "custom" && (
              <div className="space-y-4 border-t pt-4">
                <LocalizedField
                  label={`${t("fields.heroEyebrow")} (${optional})`}
                  name="hero.eyebrow"
                  form={form}
                />
                <LocalizedField
                  label={`${t("fields.heroTitle")} (${optional})`}
                  name="hero.title"
                  form={form}
                />
                <LocalizedField
                  label={`${t("fields.heroSubtitle")} (${optional})`}
                  name="hero.subtitle"
                  form={form}
                  multiline
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("groups.pageBody")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionModeToggle
              value={bodyMode}
              onChange={(next) => setValue("bodyMode", next, { shouldDirty: true })}
            />
            {bodyMode === "default" && (
              <div className="space-y-4 border-t pt-4">
                <LocalizedFieldStatic
                  label={`${t("fields.bodyHeading")} (${optional})`}
                  value={BODY_DEFAULTS.heading}
                />
                <LocalizedFieldStatic
                  label={`${t("fields.bodyContent")} (${optional})`}
                  value={BODY_DEFAULTS.content}
                  multiline
                />
              </div>
            )}
            {bodyMode === "custom" && (
              <div className="space-y-4 border-t pt-4">
                <LocalizedField
                  label={`${t("fields.bodyHeading")} (${optional})`}
                  name="body.heading"
                  form={form}
                />
                <LocalizedField
                  label={`${t("fields.bodyContent")} (${optional})`}
                  name="body.content"
                  form={form}
                  multiline
                />
              </div>
            )}
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
