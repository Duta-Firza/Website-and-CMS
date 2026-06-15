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
import { updateLeadershipLabel } from "@/lib/cms/actions";

const localized = z.object({ id: z.string(), en: z.string() });
const schema = z.object({ label: localized });
type FormValues = z.infer<typeof schema>;

interface Props {
  field: "boardOfDirectorsLabel" | "boardOfCommissionersLabel";
  initial: { id: string; en: string };
}

/**
 * Inline "Section Label" editor rendered above the leadership tables. Each
 * sub-tab (Directors / Commissioners) gets its own card so the editor sees
 * the label in context next to the group it controls.
 */
export function BoardLabelCard({ field, initial }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: initial },
  });
  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = form;

  const onSubmit = async ({ label }: FormValues) => {
    const result = await updateLeadershipLabel(field, label);
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
        <CardTitle className="text-base">{t("groups.boardLabel")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <LocalizedField label={t(`fields.${field}`)} name="label" form={form} />
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
