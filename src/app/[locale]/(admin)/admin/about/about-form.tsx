"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { MediaUpload } from "@/components/admin/media-upload";
import { DragHandle, SortableContainer, SortableItem } from "@/components/admin/sortable-list";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { useUrlTabState } from "@/components/admin/url-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { updateAboutPage, updateAboutValues } from "@/lib/cms/actions";
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
  whoWeAreTitle: localized,
  leadershipTitle: localized,
  historyTitle: localized,
  businessTitle: localized,
  credentialsTitle: localized,
  holdingStructureLabel: localized,
  holdingGroupLabel: localized,
  boardOfDirectorsLabel: localized,
  boardOfCommissionersLabel: localized,
  holdingDivisions: z.array(z.object({ key: z.string().min(1), label: localized })),
});

type FormValues = z.infer<typeof schema>;

export function AboutForm({ initial }: { initial: AboutFormValues }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;
  const { fields, append, remove, move } = useFieldArray({ control, name: "values" });
  const {
    fields: divisionFields,
    append: appendDivision,
    remove: removeDivision,
    move: moveDivision,
  } = useFieldArray({ control, name: "holdingDivisions" });

  const handleReorderValues = async (newIds: string[]) => {
    const currentIds = fields.map((f) => f.id);
    for (let i = 0; i < newIds.length; i++) {
      const from = currentIds.indexOf(newIds[i]);
      if (from !== i && from >= 0) {
        move(from, i);
        currentIds.splice(i, 0, currentIds.splice(from, 1)[0]);
      }
    }
    const result = await updateAboutValues(getValues().values);
    if (!result.ok) toast.error(result.error);
    else router.refresh();
  };

  const handleReorderDivisions = (newIds: string[]) => {
    const currentIds = divisionFields.map((f) => f.id);
    for (let i = 0; i < newIds.length; i++) {
      const from = currentIds.indexOf(newIds[i]);
      if (from !== i && from >= 0) {
        moveDivision(from, i);
        currentIds.splice(i, 0, currentIds.splice(from, 1)[0]);
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    const result = await updateAboutPage(values);
    if (result.ok) toast.success(t("saved"));
    else toast.error(result.error);
  };

  // Outer UrlTabs (at the page level) drives the active tab. AboutForm only
  // owns the four sections; the sticky save bar should hide when the user is
  // on the "content" tab (which renders a separate AboutSubPageForm).
  const [activeTab] = useUrlTabState("content", [
    "content",
    "who",
    "values",
    "business",
    "overrides",
  ] as const);
  const showStickyBar = activeTab !== "content";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <TabsContent value="who" className="mt-6">
        <Card>
          <CardContent className="space-y-5 pt-6">
            <LocalizedField label={t("fields.introParagraph")} name="intro" form={form} multiline />
            <div className="space-y-2">
              <Label>{t("fields.videoProfile")}</Label>
              <MediaUpload
                value={watch("videoUrl")}
                onChange={(url) => setValue("videoUrl", url, { shouldDirty: true })}
                accept="video"
                folder="about"
                hint={t("hints.aboutVideo")}
              />
            </div>
            <LocalizedField label={t("fields.vision")} name="vision" form={form} multiline />
            <LocalizedField label={t("fields.mission")} name="mission" form={form} multiline />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="values" className="mt-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{t("helpers.reorderValues")}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ title: { id: "", en: "" }, description: { id: "", en: "" } })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("buttons.addValue")}
              </Button>
            </div>
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("empty.values")}</p>
            )}
            <SortableContainer items={fields.map((f) => f.id)} onReorder={handleReorderValues}>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <SortableItem key={field.id} id={field.id}>
                    {({ ref, style, handleProps }) => (
                      <div
                        ref={ref}
                        style={style}
                        className="space-y-3 rounded-md border bg-muted/30 p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <DragHandle handleProps={handleProps} size="sm" />
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {t("credentials.valueIndex", { index: index + 1 })}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                        <LocalizedField
                          label={t("fields.valueTitle")}
                          name={`values.${index}.title`}
                          form={form}
                        />
                        <LocalizedField
                          label={t("fields.valueDescription")}
                          name={`values.${index}.description`}
                          form={form}
                          multiline
                        />
                      </div>
                    )}
                  </SortableItem>
                ))}
              </div>
            </SortableContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="business" className="mt-6">
        <Card>
          <CardContent className="space-y-5 pt-6">
            <p className="text-xs text-muted-foreground">{t("helpers.businessIntroNote")}</p>
            <LocalizedField
              label={t("fields.coreBusinessHeading")}
              name="coreBusinessTitle"
              form={form}
              placeholder={{ id: "Bisnis Inti", en: "Core Business" }}
            />
            <LocalizedField
              label={t("fields.coreBusinessDescription")}
              name="coreBusinessDescription"
              form={form}
              multiline
            />
            <LocalizedField
              label={t("fields.affiliatedBusinessHeading")}
              name="affiliatedBusinessTitle"
              form={form}
              placeholder={{ id: "Bisnis Afiliasi", en: "Affiliated Business" }}
            />
            <LocalizedField
              label={t("fields.affiliatedBusinessDescription")}
              name="affiliatedBusinessDescription"
              form={form}
              multiline
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="overrides" className="mt-6 space-y-6">
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("groups.pageTitleOverrides")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("helpers.overrideHint")}</p>
            </div>
            <LocalizedField
              label={t("fields.whoWeAreTitle")}
              name="whoWeAreTitle"
              form={form}
              placeholder={{ id: "Tentang PT Duta Firza", en: "About PT Duta Firza" }}
            />
            <LocalizedField
              label={t("fields.leadershipTitle")}
              name="leadershipTitle"
              form={form}
              placeholder={{ id: "Kepemimpinan", en: "Leadership" }}
            />
            <LocalizedField
              label={t("fields.historyTitle")}
              name="historyTitle"
              form={form}
              placeholder={{ id: "Sejarah", en: "History" }}
            />
            <LocalizedField
              label={t("fields.businessTitle")}
              name="businessTitle"
              form={form}
              placeholder={{ id: "Bisnis Kami", en: "Our Business" }}
            />
            <LocalizedField
              label={t("fields.credentialsTitle")}
              name="credentialsTitle"
              form={form}
              placeholder={{ id: "Kredensial", en: "Credentials" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("groups.sectionLabelOverrides")}
            </h3>
            <LocalizedField
              label={t("fields.boardOfDirectorsLabel")}
              name="boardOfDirectorsLabel"
              form={form}
              placeholder={{ id: "Dewan Direksi", en: "Board of Directors" }}
            />
            <LocalizedField
              label={t("fields.boardOfCommissionersLabel")}
              name="boardOfCommissionersLabel"
              form={form}
              placeholder={{ id: "Dewan Komisaris", en: "Board of Commissioners" }}
            />
            <LocalizedField
              label={t("fields.holdingStructureCaption")}
              name="holdingStructureLabel"
              form={form}
              placeholder={{ id: "Struktur Holding", en: "Corporate Holding Structure" }}
            />
            <LocalizedField
              label={t("fields.holdingGroupLabel")}
              name="holdingGroupLabel"
              form={form}
              placeholder={{ id: "Duta Firza Holding Group", en: "Duta Firza Holding Group" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("groups.holdingDivisions")}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("helpers.holdingDivisionsHint")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendDivision({ key: "", label: { id: "", en: "" } })}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("buttons.addDivision")}
              </Button>
            </div>
            {divisionFields.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("empty.divisions")}</p>
            )}
            <SortableContainer
              items={divisionFields.map((f) => f.id)}
              onReorder={handleReorderDivisions}
            >
              <div className="space-y-3">
                {divisionFields.map((field, index) => (
                  <SortableItem key={field.id} id={field.id}>
                    {({ ref, style, handleProps }) => (
                      <div
                        ref={ref}
                        style={style}
                        className="space-y-3 rounded-md border bg-muted/30 p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <DragHandle handleProps={handleProps} size="sm" />
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {t("credentials.divisionIndex", { index: index + 1 })}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeDivision(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`hd-key-${index}`}>{t("fields.divisionKey")}</Label>
                          <Input
                            id={`hd-key-${index}`}
                            {...register(`holdingDivisions.${index}.key`)}
                            placeholder="epc, trading, manufacturing, …"
                          />
                        </div>
                        <LocalizedField
                          label={t("fields.divisionLabel")}
                          name={`holdingDivisions.${index}.label`}
                          form={form}
                          placeholder={{ id: "EPC & Proyek", en: "EPC & Projects" }}
                        />
                      </div>
                    )}
                  </SortableItem>
                ))}
              </div>
            </SortableContainer>
          </CardContent>
        </Card>
      </TabsContent>

      {showStickyBar && (
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
