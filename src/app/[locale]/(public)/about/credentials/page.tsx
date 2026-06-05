import { getTranslations } from "next-intl/server";
import { CredentialsGrid } from "@/components/public/about/credentials-grid";
import { SectionIndex } from "@/components/public/landing/section-index";
import { PageHeader } from "@/components/public/section/page-header";
import { PageTabs } from "@/components/public/section/page-tabs";
import { resolveActiveTab } from "@/components/public/section/resolve-active-tab";
import { getCredentials } from "@/lib/cms/about";
import type { Locale } from "@/lib/cms/localize";

const TABS = [{ key: "certifications" }, { key: "acknowledgements" }] as const;

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}

function toLocale(locale: string): Locale {
  return locale === "en" ? "en" : "id";
}

export default async function CredentialsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { tab } = await searchParams;
  const titles = await getTranslations("SectionTitles");
  const tabsT = await getTranslations("Tabs");
  const tAbout = await getTranslations("About");
  const active = resolveActiveTab(TABS, tab, "certifications");
  const type = active === "certifications" ? "certification" : "acknowledgement";
  const credentials = await getCredentials(toLocale(locale), type);

  return (
    <div className="relative">
      <SectionIndex value="05" />
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

      <CredentialsGrid
        credentials={credentials}
        emptyMessage={
          active === "certifications"
            ? tAbout("certificationsEmpty")
            : tAbout("acknowledgementsEmpty")
        }
        issuerLabel={tAbout("issuer")}
        yearLabel={tAbout("year")}
      />
    </div>
  );
}
