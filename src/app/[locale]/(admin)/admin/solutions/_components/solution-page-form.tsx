"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateSolutionPage } from "@/lib/cms/actions";
import { FORM_FIELD_TYPES } from "@/lib/cms/form-fields";
import type { SolutionPageSlug, SolutionPageStatus } from "@/models/constants";
import { FormBuilderSection } from "./form-builder-section";
import { StatusGroup } from "./status-group";

const localized = z.object({ id: z.string(), en: z.string() });

const formFieldOptionZod = z.object({
  value: z.string(),
  label: localized,
});

const formFieldZod = z.object({
  key: z.string().min(1),
  label: localized,
  placeholder: localized,
  type: z.enum(FORM_FIELD_TYPES),
  required: z.boolean(),
  order: z.number().int(),
  options: z.array(formFieldOptionZod),
});

const formSettingsZod = z.object({
  enabled: z.boolean(),
  submitLabel: localized,
  successMessage: localized,
  fields: z.array(formFieldZod),
});

// `hero.backgroundImage` and `comingSoonMessage` remain in the schema for
// backward compatibility with existing docs + the server action, but the form
// UI no longer exposes them — the public page renders neither.
// `inquiryFormEnabled` is the legacy flag, kept in the schema so old docs keep
// parsing; `formSettings.enabled` is the new source of truth.
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
  formSettings: formSettingsZod,
  comingSoonMessage: localized,
});

export type SolutionPageFormValues = z.infer<typeof schema>;

export interface AdditionalTab {
  value: string;
  label: string;
  /** Rendered outside the page-form `<form>` — items in this tab manage their
   * own state and save action (typically a list-manager with its own dialog). */
  content: ReactNode;
}

const FORM_TABS_BASE = ["content"] as const;
type FormTabValue = (typeof FORM_TABS_BASE)[number] | "form";

interface Props {
  slug: SolutionPageSlug;
  initial: SolutionPageFormValues;
  /** Some pages (partners, products, epc) don't have an inquiry form — hide the tab. */
  showInquiryToggle?: boolean;
  /** Extra tabs appended to the right of the form-field tabs. Their content is
   * rendered outside the page-form `<form>` so each manager can host its own
   * nested dialog/form without invalid HTML. */
  additionalTabs?: AdditionalTab[];
}

export function SolutionPageForm({
  slug,
  initial,
  showInquiryToggle = false,
  additionalTabs = [],
}: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const formTabs = useMemo<FormTabValue[]>(
    () => (showInquiryToggle ? [...FORM_TABS_BASE, "form"] : [...FORM_TABS_BASE]),
    [showInquiryToggle],
  );
  const allowedTabs = useMemo(
    () => [...formTabs, ...additionalTabs.map((a) => a.value)],
    [formTabs, additionalTabs],
  );
  const initialTab = (() => {
    const raw = searchParams.get("tab");
    return raw && (allowedTabs as string[]).includes(raw) ? raw : "content";
  })();
  const [tab, setTab] = useState<string>(initialTab);
  const isFormTab = (formTabs as string[]).includes(tab);

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

  const handleTabChange = (next: string) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const status = watch("status") as SolutionPageStatus;
  const totalCols = formTabs.length + additionalTabs.length;

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
      <TabsList
        className="grid w-full md:w-fit"
        style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
      >
        <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
        {showInquiryToggle && <TabsTrigger value="form">{t("groups.formSettings")}</TabsTrigger>}
        {additionalTabs.map((extra) => (
          <TabsTrigger key={extra.value} value={extra.value}>
            {extra.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TabsContent value="content" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("groups.pageVisibility")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusGroup
                value={status}
                onChange={(next) => setValue("status", next, { shouldDirty: true })}
              />
              <p className="text-xs text-muted-foreground">
                {t("helpers.solutionsPageStatusHint")}
              </p>
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
        </TabsContent>

        {showInquiryToggle && (
          <TabsContent value="form" className="mt-6">
            <FormBuilderSection form={form} />
          </TabsContent>
        )}

        {isFormTab && (
          <StickyFormBar>
            <Button type="submit" variant="brand" disabled={isSubmitting} size="lg">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </StickyFormBar>
        )}
      </form>

      {additionalTabs.map((extra) => (
        <TabsContent key={extra.value} value={extra.value} className="mt-6">
          {extra.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
