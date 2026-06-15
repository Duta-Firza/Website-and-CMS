"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { IconPicker } from "@/components/admin/icon-picker";
import { LocalizedField } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertSolution } from "@/lib/cms/actions";
import { SOLUTION_ICONS, SOLUTION_KEYS, type SolutionKey } from "@/models/constants";

const schema = z.object({
  id: z.string().optional(),
  key: z.enum(SOLUTION_KEYS),
  title: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  description: z.object({ id: z.string().min(1), en: z.string().min(1) }),
  iconName: z.string().min(1),
  href: z.string().min(1),
  order: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  initial: {
    id?: string;
    key: SolutionKey;
    title: { id: string; en: string };
    description: { id: string; en: string };
    iconName: string;
    href: string;
    order: number;
  };
}

export function SolutionForm({ initial }: Props) {
  const t = useTranslations("Admin");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: FormValues) => {
    const result = await upsertSolution(values);
    if (result.ok) toast.success(t("saved"));
    else toast.error(result.error);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{initial.key}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <LocalizedField label="Title" name="title" form={form} />
          <LocalizedField label="Description" name="description" form={form} multiline />
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker
              value={watch("iconName")}
              icons={SOLUTION_ICONS}
              onChange={(v) => setValue("iconName", v, { shouldDirty: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`href-${initial.key}`}>Link</Label>
            <Input id={`href-${initial.key}`} {...register("href")} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
