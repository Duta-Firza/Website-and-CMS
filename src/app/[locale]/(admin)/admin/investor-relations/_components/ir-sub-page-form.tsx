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
import { updateIrSubPage } from "@/lib/cms/actions";
import {
  IR_SUB_PAGE_STATUSES,
  type IrSubPageSlug,
  type IrSubPageStatus,
  SECTION_MODES,
  type SectionMode,
} from "@/models/constants";
import { StatusGroup } from "../../solutions/_components/status-group";

type LocalizedStr = { id: string; en: string };
const empty: LocalizedStr = { id: "", en: "" };

const HERO_DEFAULTS: Record<IrSubPageSlug, { eyebrow: LocalizedStr; title: LocalizedStr; subtitle: LocalizedStr }> = {
  stocks: {
    eyebrow: { id: "Hubungan Investor", en: "Investor Relations" },
    title: { id: "Saham", en: "Stocks" },
    subtitle: empty,
  },
  reports: {
    eyebrow: { id: "Hubungan Investor", en: "Investor Relations" },
    title: { id: "Laporan", en: "Reports" },
    subtitle: empty,
  },
  publications: {
    eyebrow: { id: "Hubungan Investor", en: "Investor Relations" },
    title: { id: "Publikasi", en: "Publications" },
    subtitle: empty,
  },
  "press-release": {
    eyebrow: { id: "Publikasi", en: "Publications" },
    title: { id: "Siaran Pers", en: "Press Release" },
    subtitle: empty,
  },
  newsroom: {
    eyebrow: { id: "Publikasi", en: "Publications" },
    title: { id: "Newsroom", en: "Newsroom" },
    subtitle: empty,
  },
  "company-profile": {
    eyebrow: { id: "Publikasi", en: "Publications" },
    title: { id: "Profil Perusahaan", en: "Company Profile" },
    subtitle: empty,
  },
};

const BODY_DEFAULTS = { heading: empty, content: empty };

const localized = z.object({ id: z.string(), en: z.string() });

const schema = z.object({
  status: z.enum(IR_SUB_PAGE_STATUSES),
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

export type IrSubPageFormValues = z.infer<typeof schema>;

interface Props {
  slug: IrSubPageSlug;
  initial: IrSubPageFormValues;
}

export function IrSubPageForm({ slug, initial }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();

  const form = useForm<IrSubPageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: IrSubPageFormValues) => {
    const result = await updateIrSubPage(slug, values);
    if (result.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const status = watch("status") as IrSubPageStatus;
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
