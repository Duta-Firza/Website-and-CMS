"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateContactDisplay, updateSiteSettings } from "@/lib/cms/actions";

const schema = z.object({
  // SiteSettings fields
  contactEmail: z.string().email(),
  salesEmail: z.string().email(),
  phoneNumber: z.string().min(1),
  addressHO: z.object({ id: z.string(), en: z.string() }),
  addressFactory: z.object({ id: z.string(), en: z.string() }),
  officeHours: z.object({ id: z.string(), en: z.string() }),
  social: z.object({
    linkedin: z.string(),
    instagram: z.string(),
    youtube: z.string(),
  }),
  // ContactPage display toggles (gate what shows on the public page)
  showDepartmentContacts: z.boolean(),
  showSocial: z.boolean(),
  showCompanyProfile: z.boolean(),
});

export type ContactInfoFormValues = z.infer<typeof schema>;

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

export function ContactInfoForm({ initial }: { initial: ContactInfoFormValues }) {
  const t = useTranslations("Admin");
  const form = useForm<ContactInfoFormValues>({
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

  const onSubmit = async (values: ContactInfoFormValues) => {
    const { showDepartmentContacts, showSocial, showCompanyProfile, ...settings } = values;
    const [settingsResult, displayResult] = await Promise.all([
      updateSiteSettings(settings),
      updateContactDisplay({ showDepartmentContacts, showSocial, showCompanyProfile }),
    ]);
    if (settingsResult.ok && displayResult.ok) {
      toast.success(t("saved"));
    } else {
      const err =
        (!settingsResult.ok && settingsResult.error) ||
        (!displayResult.ok && displayResult.error) ||
        "Error";
      toast.error(err);
    }
  };

  const set = (name: keyof ContactInfoFormValues, v: boolean) =>
    setValue(name, v as never, { shouldDirty: true });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("groups.contact")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">{t("fields.contactEmail")}</Label>
            <Input id="contactEmail" {...register("contactEmail")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salesEmail">{t("fields.salesEmail")}</Label>
            <Input id="salesEmail" {...register("salesEmail")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">{t("common.phone")}</Label>
            <Input id="phoneNumber" {...register("phoneNumber")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("groups.addressHours")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocalizedField label={t("fields.addressHO")} name="addressHO" form={form} multiline />
          <LocalizedField
            label={t("fields.addressFactory")}
            name="addressFactory"
            form={form}
            multiline
          />
          <LocalizedField label={t("fields.officeHours")} name="officeHours" form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("groups.socialLinks")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="linkedin">{t("fields.linkedin")}</Label>
            <Input id="linkedin" {...register("social.linkedin")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">{t("fields.instagram")}</Label>
            <Input id="instagram" {...register("social.instagram")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">{t("fields.youtube")}</Label>
            <Input id="youtube" {...register("social.youtube")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("contactPage.extraSections")}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <ToggleRow
            label={t("contactPage.showDepartmentContacts")}
            hint={t("contactPage.showDepartmentContactsHint")}
            checked={watch("showDepartmentContacts")}
            onCheckedChange={(v) => set("showDepartmentContacts", v)}
          />
          <ToggleRow
            label={t("contactPage.showSocial")}
            checked={watch("showSocial")}
            onCheckedChange={(v) => set("showSocial", v)}
          />
          <ToggleRow
            label={t("contactPage.showCompanyProfile")}
            checked={watch("showCompanyProfile")}
            onCheckedChange={(v) => set("showCompanyProfile", v)}
          />
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
