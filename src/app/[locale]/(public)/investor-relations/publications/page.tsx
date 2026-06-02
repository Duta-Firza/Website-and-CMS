import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/public/section/page-header";

export default async function Page() {
  const t = await getTranslations("SectionTitles");
  const c = await getTranslations("Common");
  return (
    <>
      <PageHeader eyebrow={t("investorRelationsEyebrow")} title={t("publicationsTitle")} />
      <p className="text-muted-foreground">{c("comingSoon")}</p>
    </>
  );
}
