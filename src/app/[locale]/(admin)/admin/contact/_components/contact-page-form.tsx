"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  FormBuilderSection,
  type FormBuilderValues,
} from "@/components/admin/form-builder-section";
import { LocalizedField } from "@/components/admin/localized-field";
import { SectionModeToggle } from "@/components/admin/section-mode-toggle";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { updateContactPage } from "@/lib/cms/actions";
import {
  PAGE_STATUSES,
  type PageStatus,
  SECTION_MODES,
  type SectionMode,
} from "@/models/constants";
import { StatusGroup } from "../../solutions/_components/status-group";

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
  office: z.object({ mapEmbedUrl: z.string(), directionsUrl: z.string() }),
  factory: z.object({ mapEmbedUrl: z.string(), directionsUrl: z.string() }),
  showMap: z.boolean(),
  showFactory: z.boolean(),
  showOfficeHours: z.boolean(),
  showGetDirections: z.boolean(),
  formSettings: z.object({
    enabled: z.boolean(),
    submitLabel: localized,
    successMessage: localized,
    fields: z.array(formFieldSchema),
  }),
});

export type ContactPageFormValues = z.infer<typeof schema>;

function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function ContactPageForm({
  initial,
  activeTab,
}: {
  initial: ContactPageFormValues;
  activeTab: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();

  const form = useForm<ContactPageFormValues>({
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

  const onSubmit = async (values: ContactPageFormValues) => {
    const result = await updateContactPage(values);
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
  const optional = t("optional");
  const set = (name: keyof ContactPageFormValues, v: boolean) =>
    setValue(name, v as never, { shouldDirty: true });

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

      <TabsContent value="location" keepMounted className="space-y-4">
        {/* Locations & map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("contactPage.locationsMap")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y">
              <ToggleRow
                label={t("contactPage.showMap")}
                checked={watch("showMap")}
                onCheckedChange={(v) => set("showMap", v)}
              />
              <ToggleRow
                label={t("contactPage.showFactory")}
                checked={watch("showFactory")}
                onCheckedChange={(v) => set("showFactory", v)}
              />
              <ToggleRow
                label={t("contactPage.showOfficeHours")}
                checked={watch("showOfficeHours")}
                onCheckedChange={(v) => set("showOfficeHours", v)}
              />
              <ToggleRow
                label={t("contactPage.showGetDirections")}
                checked={watch("showGetDirections")}
                onCheckedChange={(v) => set("showGetDirections", v)}
              />
            </div>
            <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("contactPage.officeMapEmbed")}</Label>
                <Input
                  {...register("office.mapEmbedUrl")}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
              </div>
              <div className="space-y-2">
                <Label>{t("contactPage.officeDirections")}</Label>
                <Input
                  {...register("office.directionsUrl")}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
              <div className="space-y-2">
                <Label>{t("contactPage.factoryMapEmbed")}</Label>
                <Input
                  {...register("factory.mapEmbedUrl")}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
              </div>
              <div className="space-y-2">
                <Label>{t("contactPage.factoryDirections")}</Label>
                <Input
                  {...register("factory.directionsUrl")}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t("contactPage.mapEmbedHint")}</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="form" keepMounted className="space-y-4">
        {/* Contact form builder */}
        <FormBuilderSection
          form={form as unknown as UseFormReturn<FormBuilderValues>}
          enabledLabel={t("contactPage.formEnabled")}
        />
      </TabsContent>

      {activeTab !== "info" && (
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
