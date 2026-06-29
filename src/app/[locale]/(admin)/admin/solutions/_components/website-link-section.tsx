"use client";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { LocalizedField } from "@/components/admin/localized-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { SolutionPageFormValues } from "./solution-page-form";

interface Props {
  form: UseFormReturn<SolutionPageFormValues>;
}

/**
 * Editor for the optional external website CTA (e.g. the Duta Firza Technologies
 * site). Lives in its own tab; the public page renders the button only when it
 * is enabled and a URL is set, falling back to i18n copy for any blank field.
 */
export function WebsiteLinkSection({ form }: Props) {
  const t = useTranslations("Admin");
  const { register, watch, setValue } = form;
  const enabled = watch("websiteLink.enabled");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("groups.websiteLink")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch
            id="wl-enabled"
            checked={enabled}
            onCheckedChange={(v) => setValue("websiteLink.enabled", v, { shouldDirty: true })}
          />
          <Label htmlFor="wl-enabled">{t("fields.websiteLinkEnabled")}</Label>
        </div>
        <p className="text-xs text-muted-foreground">{t("helpers.websiteLinkHint")}</p>
        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="wl-url">{t("fields.websiteUrl")}</Label>
          <Input
            id="wl-url"
            type="url"
            inputMode="url"
            placeholder="https://"
            {...register("websiteLink.url")}
          />
        </div>
        <LocalizedField label={t("fields.websiteTitle")} name="websiteLink.title" form={form} />
        <LocalizedField
          label={t("fields.websiteDescription")}
          name="websiteLink.description"
          form={form}
          multiline
        />
        <LocalizedField label={t("fields.websiteCta")} name="websiteLink.ctaLabel" form={form} />
      </CardContent>
    </Card>
  );
}
