"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSiteSettings } from "@/lib/cms/actions";

const schema = z.object({
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
});

type FormValues = z.infer<typeof schema>;

export function SettingsForm({ initial }: { initial: FormValues }) {
  const t = useTranslations("Admin");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await updateSiteSettings(values);
    if (result.ok) toast.success(t("saved"));
    else toast.error(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-end">
        <Button type="submit" variant="brand" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input id="contactEmail" {...register("contactEmail")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salesEmail">Sales email</Label>
            <Input id="salesEmail" {...register("salesEmail")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone</Label>
            <Input id="phoneNumber" {...register("phoneNumber")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Addresses & Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocalizedField label="Head Office address" name="addressHO" form={form} multiline />
          <LocalizedField label="Factory address" name="addressFactory" form={form} multiline />
          <LocalizedField label="Office hours" name="officeHours" form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" {...register("social.linkedin")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input id="instagram" {...register("social.instagram")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube URL</Label>
            <Input id="youtube" {...register("social.youtube")} />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
