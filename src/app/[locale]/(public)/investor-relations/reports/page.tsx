import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/public/section/page-header";
import { PageTabs, resolveActiveTab } from "@/components/public/section/page-tabs";

const TABS = [{ key: "annual" }, { key: "financial" }] as const;

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ReportsPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const titles = await getTranslations("SectionTitles");
  const tabsT = await getTranslations("Tabs");
  const common = await getTranslations("Common");
  const active = resolveActiveTab(TABS, tab, "annual");

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
      <p className="text-muted-foreground">
        {tabsT(active)} — {common("comingSoon")}
      </p>
    </>
  );
}
