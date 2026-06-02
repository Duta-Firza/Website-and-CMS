import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/public/section/page-header";
import { PageTabs } from "@/components/public/section/page-tabs";
import { resolveActiveTab } from "@/components/public/section/resolve-active-tab";

const TABS = [{ key: "certifications" }, { key: "acknowledgements" }] as const;

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CredentialsPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const titles = await getTranslations("SectionTitles");
  const tabsT = await getTranslations("Tabs");
  const common = await getTranslations("Common");
  const active = resolveActiveTab(TABS, tab, "certifications");

  return (
    <>
      <PageHeader
        eyebrow={titles("aboutEyebrow")}
        title={titles("credentialsTitle")}
        tabs={
          <PageTabs
            tabs={TABS.map((t) => ({ key: t.key, label: tabsT(t.key) }))}
            defaultKey="certifications"
          />
        }
      />
      <p className="text-muted-foreground">
        {tabsT(active)} — {common("comingSoon")}
      </p>
    </>
  );
}
