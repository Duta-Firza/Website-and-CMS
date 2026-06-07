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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="who" className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="grid grid-cols-2 md:flex md:w-fit">
            <TabsTrigger value="who">Who We Are</TabsTrigger>
            <TabsTrigger value="values">Values</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="overrides">Overrides</TabsTrigger>
          </TabsList>
          <Button type="submit" variant="brand" disabled={isSubmitting} size="lg">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("save")}
          </Button>
        </div>

        <TabsContent value="who" className="mt-6">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <LocalizedField label="Intro paragraph" name="intro" form={form} multiline />
              <div className="space-y-2">
                <Label>Video profile</Label>
                <MediaUpload
                  value={watch("videoUrl")}
                  onChange={(url) => setValue("videoUrl", url, { shouldDirty: true })}
                  accept="video"
                  folder="about"
                />
              </div>
              <LocalizedField label="Vision" name="vision" form={form} multiline />
              <LocalizedField label="Mission" name="mission" form={form} multiline />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="values" className="mt-6">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Drag and drop reorders values immediately. Edits to title or description still
                  require Save.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ title: { id: "", en: "" }, description: { id: "", en: "" } })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add value
                </Button>
              </div>
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No values yet. Add one to display on the Who We Are page.
                </p>
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
                                Value #{index + 1}
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
                            label="Title"
                            name={`values.${index}.title`}
                            form={form}
                          />
                          <LocalizedField
                            label="Description"
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
              <p className="text-xs text-muted-foreground">
                Intro text for the /about/business page. Affiliated company list is managed
                separately under Master Content.
              </p>
              <LocalizedField
                label="Core Business heading"
                name="coreBusinessTitle"
                form={form}
                placeholder={{ id: "Bisnis Inti", en: "Core Business" }}
              />
              <LocalizedField
                label="Core Business description"
                name="coreBusinessDescription"
                form={form}
                multiline
              />
              <LocalizedField
                label="Affiliated Business heading"
                name="affiliatedBusinessTitle"
                form={form}
                placeholder={{ id: "Bisnis Afiliasi", en: "Affiliated Business" }}
              />
              <LocalizedField
                label="Affiliated Business description"
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
                  Page title overrides
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Leave empty to use the default translation. Filled values override per-locale.
                </p>
              </div>
              <LocalizedField
                label="Who We Are title"
                name="whoWeAreTitle"
                form={form}
                placeholder={{ id: "Tentang PT Duta Firza", en: "About PT Duta Firza" }}
              />
              <LocalizedField
                label="Leadership title"
                name="leadershipTitle"
                form={form}
                placeholder={{ id: "Kepemimpinan", en: "Leadership" }}
              />
              <LocalizedField
                label="History title"
                name="historyTitle"
                form={form}
                placeholder={{ id: "Sejarah", en: "History" }}
              />
              <LocalizedField
                label="Business title"
                name="businessTitle"
                form={form}
                placeholder={{ id: "Bisnis Kami", en: "Our Business" }}
              />
              <LocalizedField
                label="Credentials title"
                name="credentialsTitle"
                form={form}
                placeholder={{ id: "Kredensial", en: "Credentials" }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Section label overrides
              </h3>
              <LocalizedField
                label="Board of Directors label"
                name="boardOfDirectorsLabel"
                form={form}
                placeholder={{ id: "Dewan Direksi", en: "Board of Directors" }}
              />
              <LocalizedField
                label="Board of Commissioners label"
                name="boardOfCommissionersLabel"
                form={form}
                placeholder={{ id: "Dewan Komisaris", en: "Board of Commissioners" }}
              />
              <LocalizedField
                label="Holding structure caption"
                name="holdingStructureLabel"
                form={form}
                placeholder={{ id: "Struktur Holding", en: "Corporate Holding Structure" }}
              />
              <LocalizedField
                label="Holding group label (parent box)"
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
                    Holding divisions
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Boxes under the parent group on the diagram. Default falls back to the public
                    nav labels when this list is empty.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendDivision({ key: "", label: { id: "", en: "" } })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add division
                </Button>
              </div>
              {divisionFields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No custom divisions. Defaults to EPC, Trading, Manufacturing.
                </p>
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
                                Division #{index + 1}
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
                            <Label htmlFor={`hd-key-${index}`}>Key</Label>
                            <Input
                              id={`hd-key-${index}`}
                              {...register(`holdingDivisions.${index}.key`)}
                              placeholder="epc, trading, manufacturing, …"
                            />
                          </div>
                          <LocalizedField
                            label="Label"
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
      </Tabs>
    </form>
  );
}
