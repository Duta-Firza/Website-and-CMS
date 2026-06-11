import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CredentialsGrid } from "@/components/public/about/credentials-grid";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { SectionIndex } from "@/components/public/landing/section-index";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { PageTabs } from "@/components/public/section/page-tabs";
import { resolveActiveTab } from "@/components/public/section/resolve-active-tab";
import { getAboutPage, getAboutSubPage, getCredentials } from "@/lib/cms/about";
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
  const safeLocale = toLocale(locale);
  const [credentials, about, meta] = await Promise.all([
    getCredentials(safeLocale, type),
    getAboutPage(safeLocale),
    getAboutSubPage("credentials", safeLocale),
  ]);

  if (meta.status === "hidden") notFound();

  const eyebrow = meta.hero.eyebrow || titles("aboutEyebrow");
  const title = meta.hero.title || about.credentialsTitle?.trim() || titles("credentialsTitle");
  const subtitle = meta.hero.subtitle || "";

  if (meta.status === "comingSoon") {
    return (
      <>
        <PageHeader eyebrow={eyebrow} title={title} description={subtitle} />
        <ComingSoonPage
          eyebrow={eyebrow}
          title={meta.body.heading || undefined}
          message={meta.body.content || undefined}
        />
      </>
    );
  }

  return (
    <div className="relative">
      <SectionIndex value="05" />
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={subtitle}
        tabs={
          <PageTabs
            tabs={TABS.map((t) => ({ key: t.key, label: tabsT(t.key) }))}
            defaultKey="certifications"
          />
        }
      />

      {(meta.body.heading || meta.body.content) && (
        <ScrollReveal className="mb-12 max-w-3xl space-y-3">
          {meta.body.heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
              {meta.body.heading}
            </h2>
          )}
          {meta.body.content && (
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {meta.body.content}
            </p>
          )}
        </ScrollReveal>
      )}

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
