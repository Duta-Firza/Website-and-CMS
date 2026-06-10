import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { InquiryForm } from "@/components/public/inquiry-form";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { SolutionsRow } from "@/components/public/solutions/solutions-row";
import { Card, CardContent } from "@/components/ui/card";
import { getSolutions } from "@/lib/cms/home";
import type { Locale } from "@/lib/cms/localize";
import { getSolutionPage, getSolutionPageVisibilityMap } from "@/lib/cms/solutions";

export default async function TradingPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, solutions, t, tSections, visibility] = await Promise.all([
    getSolutionPage("trading", locale),
    getSolutions(locale),
    getTranslations("Solutions"),
    getTranslations("SectionTitles"),
    getSolutionPageVisibilityMap(),
  ]);

  if (page.status === "hidden") notFound();

  const eyebrow = page.hero.eyebrow || tSections("solutionsEyebrow");
  const title = page.hero.title || tSections("tradingTitle");
  const subtitle = page.hero.subtitle || "";

  if (page.status === "comingSoon") {
    return (
      <>
        <PageHeader eyebrow={eyebrow} title={title} description={subtitle} />
        <ComingSoonPage
          eyebrow={eyebrow}
          title={page.body.heading || undefined}
          message={page.comingSoonMessage || undefined}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={subtitle} />

      {(page.body.heading || page.body.content) && (
        <ScrollReveal className="mb-12 max-w-3xl space-y-3">
          {page.body.heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
              {page.body.heading}
            </h2>
          )}
          {page.body.content && (
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {page.body.content}
            </p>
          )}
        </ScrollReveal>
      )}

      <SidePanel
        locale={locale}
        visibility={visibility}
        sidePanelTitle={t("trading.sidePanelTitle")}
        viewPartnersLabel={t("trading.viewPartners")}
        viewProductsLabel={t("trading.viewProducts")}
      />

      {page.inquiryFormEnabled && (
        <ScrollReveal>
          <div className="mt-12 rounded-2xl border bg-card p-6 md:p-10">
            <div className="mb-6 max-w-2xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
                {t("trading.inquiryTitle")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("trading.inquirySubtitle")}
              </p>
            </div>
            <InquiryForm source="trading" />
          </div>
        </ScrollReveal>
      )}

      <SolutionsRow solutions={solutions} activeKey="trading" />
    </>
  );
}

interface SidePanelProps {
  locale: Locale;
  visibility: Awaited<ReturnType<typeof getSolutionPageVisibilityMap>>;
  sidePanelTitle: string;
  viewPartnersLabel: string;
  viewProductsLabel: string;
}

function SidePanel({
  locale,
  visibility,
  sidePanelTitle,
  viewPartnersLabel,
  viewProductsLabel,
}: SidePanelProps) {
  const links: { label: string; href: string }[] = [];
  if (visibility["trading-partners"] !== "hidden") {
    links.push({ label: viewPartnersLabel, href: `/${locale}/solutions/trading/partners` });
  }
  if (visibility["trading-products"] !== "hidden") {
    links.push({ label: viewProductsLabel, href: `/${locale}/solutions/trading/products` });
  }
  if (links.length === 0) return null;
  return (
    <ScrollReveal>
      <Card>
        <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-brand-deep dark:text-foreground">
            {sidePanelTitle}
          </p>
          <div className="flex flex-wrap gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-accent hover:underline"
              >
                {l.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}
