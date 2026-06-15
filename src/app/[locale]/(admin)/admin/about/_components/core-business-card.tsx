"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCoreBusinessSection } from "@/lib/cms/actions";

const localized = z.object({ id: z.string(), en: z.string() });
const schema = z.object({
  coreBusinessTitle: localized,
  coreBusinessDescription: localized,
});
type FormValues = z.infer<typeof schema>;

interface Props {
  initial: FormValues;
}

export function CoreBusinessCard({ initial }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await updateCoreBusinessSection(values);
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
        <CardTitle className="text-base">{t("groups.coreBusiness")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <LocalizedField
            label={t("fields.coreBusinessHeading")}
            name="coreBusinessTitle"
            form={form}
          />
          <LocalizedField
            label={t("fields.coreBusinessDescription")}
            name="coreBusinessDescription"
            form={form}
            multiline
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
