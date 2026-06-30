"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type UseFormReturn, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  FormBuilderSection,
  type FormBuilderValues,
} from "@/components/admin/form-builder-section";
import { IconPicker } from "@/components/admin/icon-picker";
import { LocalizedField } from "@/components/admin/localized-field";
import { MediaUpload } from "@/components/admin/media-upload";
import { SectionModeToggle } from "@/components/admin/section-mode-toggle";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { updateCareerPage } from "@/lib/cms/actions";
import {
  PAGE_STATUSES,
  type PageStatus,
  SECTION_MODES,
  type SectionMode,
  STAT_ICONS,
} from "@/models/constants";
import { StatusGroup } from "../../../solutions/_components/status-group";

const localized = z.object({ id: z.string(), en: z.string() });
const formFieldSchema = z.object({
  key: z.string(),
  label: localized,
  placeholder: localized,
  type: z.enum(["text", "email", "tel", "textarea", "number", "select"]),
  required: z.boolean(),
  order: z.number().int(),
  options: z.array(z.object({ value: z.string(), label: localized })),
});

const schema = z.object({
  status: z.enum(PAGE_STATUSES),
  heroMode: z.enum(SECTION_MODES),
  bodyMode: z.enum(SECTION_MODES),
  hero: z.object({ eyebrow: localized, title: localized, subtitle: localized }),
  body: z.object({ heading: localized, content: localized }),
  showJobBoards: z.boolean(),
  jobBoards: z.array(
    z.object({
      key: z.string(),
      label: localized,
      url: z.string(),
      logoUrl: z.string(),
      enabled: z.boolean(),
    }),
  ),
  whyJoinMode: z.enum(SECTION_MODES),
  whyJoin: z.object({ heading: localized, content: localized }),
  showBenefits: z.boolean(),
  benefits: z.array(z.object({ icon: z.string(), title: localized, description: localized })),
  showOpenings: z.boolean(),
  // Named `formSettings` (not `applicationForm`) so the shared FormBuilderSection —
  // which is hardcoded to the `formSettings.*` field path — can edit it directly.
  // Mapped back to `applicationForm` on submit.
  formSettings: z.object({
    enabled: z.boolean(),
    submitLabel: localized,
    successMessage: localized,
    fields: z.array(formFieldSchema),
  }),
});

export type CareerPageFormValues = z.infer<typeof schema>;

export function CareerPageForm({
  initial,
  activeTab,
}: {
  initial: CareerPageFormValues;
  activeTab: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();

  const form = useForm<CareerPageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { isSubmitting },
  } = form;

  const boards = useFieldArray({ control, name: "jobBoards" });
  const benefits = useFieldArray({ control, name: "benefits" });

  const onSubmit = async (values: CareerPageFormValues) => {
    // `formSettings` is the in-app application form; persist it as `applicationForm`.
    const result = await updateCareerPage({ ...values, applicationForm: values.formSettings });
    if (result.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const status = watch("status") as PageStatus;
  const heroMode = watch("heroMode") as SectionMode;
  const bodyMode = watch("bodyMode") as SectionMode;
  const whyJoinMode = watch("whyJoinMode") as SectionMode;
  const optional = t("optional");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TabsContent value="content" keepMounted className="space-y-4">
        {/* Page visibility */}
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

        {/* Page title */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("groups.pageTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionModeToggle
              value={heroMode}
              onChange={(next) => setValue("heroMode", next, { shouldDirty: true })}
            />
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

        {/* Page body / intro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("groups.pageBody")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionModeToggle
              value={bodyMode}
              onChange={(next) => setValue("bodyMode", next, { shouldDirty: true })}
            />
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
      </TabsContent>

      <TabsContent value="boards" keepMounted className="space-y-4">
        {/* Job boards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t("careerPage.jobBoards")}</CardTitle>
            <Switch
              checked={watch("showJobBoards")}
              onCheckedChange={(v) => setValue("showJobBoards", v, { shouldDirty: true })}
              aria-label={t("careerPage.jobBoards")}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {boards.fields.length === 0 && (
              <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                {t("careerPage.noJobBoards")}
              </p>
            )}
            {boards.fields.map((row, index) => (
              <div key={row.id} className="space-y-3 rounded-md border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={watch(`jobBoards.${index}.enabled`)}
                      onCheckedChange={(v) =>
                        setValue(`jobBoards.${index}.enabled`, v, { shouldDirty: true })
                      }
                      aria-label={t("common.active")}
                    />
                    <Input
                      {...register(`jobBoards.${index}.key`)}
                      placeholder="key"
                      className="h-8 w-28 font-mono text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => boards.remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
                <LocalizedField
                  label={t("formBuilder.label")}
                  name={`jobBoards.${index}.label`}
                  form={form}
                />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">URL</Label>
                  <Input {...register(`jobBoards.${index}.url`)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {t("careerPage.boardLogo")}
                  </Label>
                  <MediaUpload
                    accept="image"
                    folder="job-boards"
                    aspectRatio={3}
                    className="max-w-sm"
                    value={watch(`jobBoards.${index}.logoUrl`)}
                    onChange={(url) =>
                      setValue(`jobBoards.${index}.logoUrl`, url, { shouldDirty: true })
                    }
                    hint={t("careerPage.boardLogoHint")}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                boards.append({
                  key: "",
                  label: { id: "", en: "" },
                  url: "",
                  logoUrl: "",
                  enabled: true,
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t("careerPage.addJobBoard")}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="culture" keepMounted className="space-y-4">
        {/* Why join us */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("careerPage.whyJoin")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionModeToggle
              value={whyJoinMode}
              onChange={(next) => setValue("whyJoinMode", next, { shouldDirty: true })}
            />
            {whyJoinMode === "custom" && (
              <div className="space-y-4 border-t pt-4">
                <LocalizedField
                  label={`${t("fields.bodyHeading")} (${optional})`}
                  name="whyJoin.heading"
                  form={form}
                />
                <LocalizedField
                  label={`${t("fields.bodyContent")} (${optional})`}
                  name="whyJoin.content"
                  form={form}
                  multiline
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t("careerPage.benefits")}</CardTitle>
            <Switch
              checked={watch("showBenefits")}
              onCheckedChange={(v) => setValue("showBenefits", v, { shouldDirty: true })}
              aria-label={t("careerPage.benefits")}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {benefits.fields.length === 0 && (
              <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                {t("careerPage.noBenefits")}
              </p>
            )}
            {benefits.fields.map((row, index) => (
              <div key={row.id} className="space-y-3 rounded-md border bg-card p-3">
                <div className="flex items-start gap-3">
                  <div className="w-40 shrink-0 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("fields.statIcon")}</Label>
                    <IconPicker
                      value={watch(`benefits.${index}.icon`)}
                      onChange={(name) =>
                        setValue(`benefits.${index}.icon`, name, { shouldDirty: true })
                      }
                      icons={STAT_ICONS}
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <LocalizedField
                      label={t("common.title")}
                      name={`benefits.${index}.title`}
                      form={form}
                    />
                    <LocalizedField
                      label={t("common.description")}
                      name={`benefits.${index}.description`}
                      form={form}
                      multiline
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => benefits.remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                benefits.append({
                  icon: "Award",
                  title: { id: "", en: "" },
                  description: { id: "", en: "" },
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t("careerPage.addBenefit")}
            </Button>
          </CardContent>
        </Card>

        {/* Openings toggle */}
        <Card>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="space-y-0.5">
              <Label>{t("careerPage.showOpenings")}</Label>
              <p className="text-xs text-muted-foreground">{t("careerPage.showOpeningsHint")}</p>
            </div>
            <Switch
              checked={watch("showOpenings")}
              onCheckedChange={(v) => setValue("showOpenings", v, { shouldDirty: true })}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="applyForm" keepMounted className="space-y-4">
        {/* In-app application form (used by openings with applyMode = form) */}
        <p className="text-sm text-muted-foreground">{t("careerPage.applyFormIntro")}</p>
        <FormBuilderSection
          form={form as unknown as UseFormReturn<FormBuilderValues>}
          enabledLabel={t("careerPage.applyFormEnabled")}
        />
      </TabsContent>

      {activeTab !== "items" && (
        <StickyFormBar>
          <Button type="submit" variant="brand" disabled={isSubmitting} size="lg">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("save")}
          </Button>
        </StickyFormBar>
      )}
    </form>
  );
}
