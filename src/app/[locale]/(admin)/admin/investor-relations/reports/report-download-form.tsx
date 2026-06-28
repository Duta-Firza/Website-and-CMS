"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  FormBuilderSection,
  type FormBuilderValues,
} from "@/components/admin/form-builder-section";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateReportDownloadFormSettings } from "@/lib/cms/actions";
import { FORM_FIELD_TYPES, type FormSettings } from "@/lib/cms/form-fields";
import { REPORT_DOWNLOAD_SYSTEM_KEYS } from "@/lib/cms/report-download-form";

const localized = z.object({ id: z.string(), en: z.string() });
const formFieldOptionZod = z.object({ value: z.string(), label: localized });
const formFieldZod = z.object({
  key: z.string().min(1),
  label: localized,
  placeholder: localized,
  type: z.enum(FORM_FIELD_TYPES),
  required: z.boolean(),
  order: z.number().int(),
  options: z.array(formFieldOptionZod),
});
const schema = z.object({
  formSettings: z.object({
    enabled: z.boolean(),
    submitLabel: localized,
    successMessage: localized,
    fields: z.array(formFieldZod),
  }),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  initial: FormSettings;
  /** Link to the captured-leads inbox. */
  leadsHref: string;
}

export function ReportDownloadFormSettingsForm({ initial, leadsHref }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { formSettings: initial },
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await updateReportDownloadFormSettings(values.formSettings);
    if (result.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("reportLeads.settingsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-muted-foreground">{t("reportLeads.settingsHint")}</p>
          <Link href={leadsHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            {t("reportLeads.viewLeads")}
          </Link>
        </CardContent>
      </Card>

      <FormBuilderSection
        form={form as unknown as UseFormReturn<FormBuilderValues>}
        systemKeys={REPORT_DOWNLOAD_SYSTEM_KEYS}
        enabledLabel={t("formBuilder.enabled")}
      />

      <StickyFormBar>
        <Button type="submit" variant="brand" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </StickyFormBar>
    </form>
  );
}
