import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/public/section/page-header";
import { UnderConstruction } from "@/components/public/under-construction";

export default async function Page() {
  const t = await getTranslations("SectionTitles");
  return (
    <>
      <PageHeader eyebrow={t("investorRelationsEyebrow")} title={t("stocksTitle")} />
      <UnderConstruction />
    </>
  );
}
