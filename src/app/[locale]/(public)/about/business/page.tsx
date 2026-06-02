import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/public/section/page-header";

export default async function Page() {
  const t = await getTranslations("SectionTitles");
  const c = await getTranslations("Common");
  return (
    <>
      <PageHeader eyebrow={t("aboutEyebrow")} title={t("businessTitle")} />
      <p className="text-muted-foreground">{c("comingSoon")}</p>
    </>
  );
}
