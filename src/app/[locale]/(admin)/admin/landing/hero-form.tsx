"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { MediaUpload } from "@/components/admin/media-upload";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateHomeHero } from "@/lib/cms/actions";

const localizedOptional = z.object({ id: z.string(), en: z.string() });
const localizedRequired = z.object({ id: z.string().min(1), en: z.string().min(1) });

const schema = z.object({
  eyebrow: localizedOptional,
  title: localizedRequired,
  subtitle: localizedRequired,
  ctaLabel: localizedRequired,
  ctaHref: z.string().min(1),
  secondaryCtaLabel: localizedOptional,
  secondaryCtaHref: z.string(),
  backgroundImage: z.string(),
  heroDecorations: z.boolean(),
  partnersTitle: localizedOptional,
  partnersSubtitle: localizedOptional,
  solutionsTitle: localizedOptional,
  solutionsSubtitle: localizedOptional,
  projectsTitle: localizedOptional,
  projectsSubtitle: localizedOptional,
  reachTitle: localizedOptional,
  reachSubtitle: localizedOptional,
  customersTitle: localizedOptional,
});

type FormValues = z.infer<typeof schema>;

export function HeroForm({ initial }: { initial: FormValues }) {
  const t = useTranslations("Admin");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await updateHomeHero(values);
    if (result.ok) toast.success(t("saved"));
    else toast.error(result.error);
  };

  const bgImage = watch("backgroundImage");
  const heroDecorations = watch("heroDecorations");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardContent className="space-y-5 pt-6">
          <LocalizedField
            label={t("fields.heroEyebrow")}
            name="eyebrow"
            form={form}
            placeholder={{ id: "Energi & EPC Indonesia", en: "Indonesia Energy & EPC" }}
          />
          <LocalizedField label={t("fields.heroTitle")} name="title" form={form} multiline />
          <LocalizedField label={t("fields.heroSubtitle")} name="subtitle" form={form} multiline />
          <LocalizedField label={t("fields.heroCtaLabel")} name="ctaLabel" form={form} />
          <div className="space-y-2">
            <Label htmlFor="h-href">{t("fields.heroCtaHref")}</Label>
            <Input id="h-href" {...register("ctaHref")} />
          </div>
          <div className="space-y-2">
            <Label>{t("fields.heroBgImage")}</Label>
            <MediaUpload
              value={bgImage}
              onChange={(url) => setValue("backgroundImage", url, { shouldDirty: true })}
              accept="image"
              folder="landing"
              aspectRatio={16 / 9}
              hint={t("hints.heroBg")}
            />
          </div>

          {/* Decorations toggle — only relevant when a background image is set */}
          <div
            className={
              bgImage
                ? "flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3"
                : "flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3 opacity-40"
            }
          >
            <div className="space-y-0.5">
              <Label
                htmlFor="hero-decorations"
                className="cursor-pointer text-sm font-medium"
              >
                {t("fields.heroDecorations")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("hints.heroDecorations")}
              </p>
            </div>
            <Switch
              id="hero-decorations"
              checked={heroDecorations}
              disabled={!bgImage}
              onCheckedChange={(checked) =>
                setValue("heroDecorations", checked, { shouldDirty: true })
              }
            />
          </div>

          <LocalizedField
            label={t("fields.heroSecondaryCta")}
            name="secondaryCtaLabel"
            form={form}
            placeholder={{ id: "Layanan Kami", en: "Our Services" }}
          />
          <div className="space-y-2">
            <Label htmlFor="h-href2">{t("fields.heroSecondaryCtaHref")}</Label>
            <Input id="h-href2" {...register("secondaryCtaHref")} placeholder="/solutions" />
          </div>

          <details className="rounded-lg border bg-muted/30 p-4">
            <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("helpers.overrideLabelsTitle")}
            </summary>
            <div className="mt-4 space-y-5">
              <p className="text-xs text-muted-foreground">{t("helpers.overrideLabelsHint")}</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <LocalizedField
                  label={t("fields.partnersTitleOverride")}
                  name="partnersTitle"
                  form={form}
                  placeholder={{ id: "Mitra Kami", en: "Our Partners" }}
                />
                <LocalizedField
                  label={t("fields.partnersSubtitle")}
                  name="partnersSubtitle"
                  form={form}
                  multiline
                />
                <LocalizedField
                  label={t("fields.solutionsTitleOverride")}
                  name="solutionsTitle"
                  form={form}
                  placeholder={{ id: "Solusi Kami", en: "Our Solutions" }}
                />
                <LocalizedField
                  label={t("fields.solutionsSubtitle")}
                  name="solutionsSubtitle"
                  form={form}
                  multiline
                />
                <LocalizedField
                  label={t("fields.projectsTitleOverride")}
                  name="projectsTitle"
                  form={form}
                  placeholder={{ id: "Proyek Unggulan", en: "Project Highlights" }}
                />
                <LocalizedField
                  label={t("fields.projectsSubtitle")}
                  name="projectsSubtitle"
                  form={form}
                  multiline
                />
                <LocalizedField
                  label={t("fields.reachTitleOverride")}
                  name="reachTitle"
                  form={form}
                  placeholder={{ id: "Jangkauan Kami", en: "Our Reach" }}
                />
                <LocalizedField
                  label={t("fields.reachSubtitle")}
                  name="reachSubtitle"
                  form={form}
                  multiline
                />
                <LocalizedField
                  label={t("fields.customersTitleOverride")}
                  name="customersTitle"
                  form={form}
                  placeholder={{
                    id: "Dipercaya Lintas Industri",
                    en: "Trusted Across the Industry",
                  }}
                />
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      <StickyFormBar>
        <Button type="submit" variant="brand" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </StickyFormBar>
    </form>
  );
}
