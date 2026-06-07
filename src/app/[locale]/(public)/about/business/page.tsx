import { getTranslations } from "next-intl/server";
import { AffiliatedBusinessCard } from "@/components/public/about/affiliated-business-card";
import { HoldingStructure } from "@/components/public/about/holding-structure";
import { SectionIndex } from "@/components/public/landing/section-index";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { getAboutPage, getAffiliatedBusinesses } from "@/lib/cms/about";
import type { Locale } from "@/lib/cms/localize";

interface PageParams {
  locale: string;
}

function toLocale(locale: string): Locale {
  return locale === "en" ? "en" : "id";
}

export default async function BusinessPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const safeLocale = toLocale(locale);
  const t = await getTranslations("SectionTitles");
  const tNav = await getTranslations("Nav");
  const tAbout = await getTranslations("About");
  const [about, businesses] = await Promise.all([
    getAboutPage(safeLocale),
    getAffiliatedBusinesses(safeLocale),
  ]);

  const fallbackDivisions = [
    { key: "epc", label: tNav("epc") },
    { key: "trading", label: tNav("trading") },
    { key: "manufacturing", label: tNav("manufacturing") },
  ];
  const knownNavKeys = new Set(["epc", "trading", "manufacturing"]);
  const divisions =
    about.holdingDivisions.length > 0
      ? about.holdingDivisions.map((d) => {
          const label = d.label?.trim();
          if (label) return { key: d.key, label };
          if (knownNavKeys.has(d.key)) return { key: d.key, label: tNav(d.key) };
          return { key: d.key, label: d.key };
        })
      : fallbackDivisions;

  return (
    <div className="relative">
      <SectionIndex value="04" />
      <PageHeader
        eyebrow={t("aboutEyebrow")}
        title={about.businessTitle?.trim() || t("businessTitle")}
      />

      {about.coreBusinessDescription && (
        <ScrollReveal className="mb-12">
          <span className="mb-4 block h-0.75 w-10 bg-brand-accent" aria-hidden />
          <h2 className="mb-3 text-xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-2xl">
            {about.coreBusinessTitle || tAbout("coreBusiness")}
          </h2>
          <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
            {about.coreBusinessDescription}
          </p>
        </ScrollReveal>
      )}

      <ScrollReveal className="mb-12">
        <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {about.holdingStructureLabel?.trim() || tAbout("holdingStructure")}
        </p>
        <HoldingStructure
          groupLabel={about.holdingGroupLabel?.trim() || tAbout("holdingGroupLabel")}
          divisions={divisions}
        />
      </ScrollReveal>

      {(about.affiliatedBusinessDescription || businesses.length > 0) && (
        <section className="mb-4">
          <ScrollReveal className="mb-8">
            <span className="mb-4 block h-0.75 w-10 bg-brand-accent" aria-hidden />
            <h2 className="mb-3 text-xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-2xl">
              {about.affiliatedBusinessTitle || tAbout("affiliatedBusiness")}
            </h2>
            {about.affiliatedBusinessDescription && (
              <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
                {about.affiliatedBusinessDescription}
              </p>
            )}
          </ScrollReveal>
          {businesses.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {businesses.map((b, idx) => (
                <ScrollReveal key={b.id} delay={idx * 100}>
                  <AffiliatedBusinessCard business={b} visitLabel={tAbout("visitWebsite")} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
