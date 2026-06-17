"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useController, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { MediaUpload } from "@/components/admin/media-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCompanyProfileUrl } from "@/lib/cms/actions";

const schema = z.object({ companyProfileUrl: z.string() });
type FormValues = z.infer<typeof schema>;

export function CompanyProfileCard({ initial }: { initial: string }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: { companyProfileUrl: initial } });

  const { field } = useController({ control, name: "companyProfileUrl" });

  const onSubmit = async (values: FormValues) => {
    const result = await updateCompanyProfileUrl(values.companyProfileUrl);
    if (result.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("fields.companyProfileUrl")}</CardTitle>
        <CardDescription>{t("hints.companyProfileUrlHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <MediaUpload
            accept="pdf"
            folder="company-profile"
            value={field.value}
            onChange={field.onChange}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
