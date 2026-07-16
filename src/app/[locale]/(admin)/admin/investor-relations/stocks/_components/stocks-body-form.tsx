"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LocalizedField, LocalizedFieldStatic } from "@/components/admin/localized-field";
import { LocalizedRichField } from "@/components/admin/localized-rich-field";
import { SectionModeToggle } from "@/components/admin/section-mode-toggle";
import { StickyFormBar } from "@/components/admin/sticky-form-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateIrSubPageBody } from "@/lib/cms/actions";
import { SECTION_MODES, type SectionMode } from "@/models/constants";

const empty = { id: "", en: "" };
const BODY_DEFAULTS = { heading: empty, content: empty };

const localized = z.object({ id: z.string(), en: z.string() });

const schema = z.object({
  bodyMode: z.enum(SECTION_MODES),
  body: z.object({ heading: localized, content: localized }),
});

export type StocksBodyFormValues = z.infer<typeof schema>;

interface Props {
  initial: StocksBodyFormValues;
}

/**
 * Page Body tab for /admin/investor-relations/stocks. Same shape as the body
 * card in <IrSubPageForm>, except the content field is the Tiptap editor the
 * newsroom uses, so the paragraph is stored as HTML and rendered as `prose`.
 */
export function StocksBodyForm({ initial }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();

  const form = useForm<StocksBodyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: StocksBodyFormValues) => {
    const result = await updateIrSubPageBody("stocks", values);
    if (result.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const bodyMode = watch("bodyMode") as SectionMode;
  const optional = t("optional");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("groups.pageBody")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionModeToggle
            value={bodyMode}
            onChange={(next) => setValue("bodyMode", next, { shouldDirty: true })}
          />
          {bodyMode === "default" && (
            <div className="space-y-4 border-t pt-4">
              <LocalizedFieldStatic
                label={`${t("fields.bodyHeading")} (${optional})`}
                value={BODY_DEFAULTS.heading}
              />
              <LocalizedFieldStatic
                label={`${t("fields.bodyContent")} (${optional})`}
                value={BODY_DEFAULTS.content}
                multiline
              />
            </div>
          )}
          {bodyMode === "custom" && (
            <div className="space-y-4 border-t pt-4">
              <LocalizedField
                label={`${t("fields.bodyHeading")} (${optional})`}
                name="body.heading"
                form={form}
              />
              <LocalizedRichField
                label={`${t("fields.bodyContent")} (${optional})`}
                name="body.content"
                form={form}
              />
              <p className="text-xs text-muted-foreground">{t("hints.paragraphRichHint")}</p>
            </div>
          )}
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
