import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/public/section/page-header";
import { PageTabs } from "@/components/public/section/page-tabs";
import { UnderConstruction } from "@/components/public/under-construction";

const TABS = [{ key: "annual" }, { key: "financial" }] as const;

export default async function ReportsPage() {
  const titles = await getTranslations("SectionTitles");
  const tabsT = await getTranslations("Tabs");

  return (
    <>
      <PageHeader
        eyebrow={titles("investorRelationsEyebrow")}
        title={titles("reportsTitle")}
        tabs={
          <PageTabs
            tabs={TABS.map((t) => ({ key: t.key, label: tabsT(t.key) }))}
            defaultKey="annual"
          />
        }
      />
      <UnderConstruction />
    </>
  );
}
