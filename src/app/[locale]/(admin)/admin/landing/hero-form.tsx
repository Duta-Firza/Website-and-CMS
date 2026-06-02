"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  backgroundImage: z.string().min(1),
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
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await updateHomeHero(values);
    if (result.ok) toast.success(t("saved"));
    else toast.error(result.error);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <LocalizedField
            label="Eyebrow (optional)"
            name="eyebrow"
            form={form}
            placeholder={{ id: "Energi & EPC Indonesia", en: "Indonesia Energy & EPC" }}
          />
          <LocalizedField label="Title" name="title" form={form} multiline />
          <LocalizedField label="Subtitle" name="subtitle" form={form} multiline />
          <LocalizedField label="Primary CTA label" name="ctaLabel" form={form} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="h-href">Primary CTA link</Label>
              <Input id="h-href" {...register("ctaHref")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="h-bg">Background image URL</Label>
              <Input id="h-bg" {...register("backgroundImage")} />
            </div>
          </div>
          <LocalizedField
            label="Secondary CTA label (optional)"
            name="secondaryCtaLabel"
            form={form}
            placeholder={{ id: "Layanan Kami", en: "Our Services" }}
          />
          <div className="space-y-2">
            <Label htmlFor="h-href2">Secondary CTA link (optional)</Label>
            <Input id="h-href2" {...register("secondaryCtaHref")} placeholder="/solutions" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
