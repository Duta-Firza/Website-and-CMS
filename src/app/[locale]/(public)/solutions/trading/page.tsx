import { ArrowUpRight, Handshake, type LucideIcon, Package } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { InquiryForm } from "@/components/public/inquiry-form";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { SolutionsRow } from "@/components/public/solutions/solutions-row";
import { getSolutions } from "@/lib/cms/home";
import type { Locale } from "@/lib/cms/localize";
import {
  getSolutionPage,
  getSolutionPageFormSettings,
  getSolutionPageVisibilityMap,
} from "@/lib/cms/solutions";

export default async function TradingPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, solutions, t, tSections, visibility, formSettings] = await Promise.all([
    getSolutionPage("trading", locale),
    getSolutions(locale),
    getTranslations("Solutions"),
    getTranslations("SectionTitles"),
    getSolutionPageVisibilityMap(),
    getSolutionPageFormSettings("trading", locale),
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

      {formSettings.enabled && (
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
            <InquiryForm
              source="trading"
              fields={formSettings.fields}
              submitLabel={formSettings.submitLabel}
              successMessage={formSettings.successMessage}
            />
          </div>
        </ScrollReveal>
      )}

      <SidePanel
        locale={locale}
        visibility={visibility}
        sidePanelTitle={t("trading.sidePanelTitle")}
        viewPartnersLabel={t("trading.viewPartners")}
        viewProductsLabel={t("trading.viewProducts")}
        partnersDescription={t("partners.defaultSubtitle")}
        productsDescription={t("products.defaultSubtitle")}
      />

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
  partnersDescription: string;
  productsDescription: string;
}

interface SidePanelCard {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

function SidePanel({
  locale,
  visibility,
  sidePanelTitle,
  viewPartnersLabel,
  viewProductsLabel,
  partnersDescription,
  productsDescription,
}: SidePanelProps) {
  const cards: SidePanelCard[] = [];
  if (visibility["trading-partners"] !== "hidden") {
    cards.push({
      number: "01",
      icon: Handshake,
      title: viewPartnersLabel,
      description: partnersDescription,
      href: `/${locale}/solutions/trading/partners`,
    });
  }
  if (visibility["trading-products"] !== "hidden") {
    cards.push({
      number: cards.length === 0 ? "01" : "02",
      icon: Package,
      title: viewProductsLabel,
      description: productsDescription,
      href: `/${locale}/solutions/trading/products`,
    });
  }
  if (cards.length === 0) return null;
  return (
    <section className="mt-12">
      <ScrollReveal className="mb-6 max-w-2xl space-y-2">
        <span className="block h-0.75 w-10 bg-brand-accent" aria-hidden />
        <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
          {sidePanelTitle}
        </h2>
      </ScrollReveal>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <ScrollReveal key={card.href} delay={idx * 80}>
              <Link
                href={card.href}
                className="group/cta relative flex h-full flex-col gap-5 overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent/40 hover:shadow-md"
              >
                {/* Top accent stripe — slides in on hover. Mirrors the
                    treatment used on Solution + Project cards. */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-brand-accent transition-transform duration-500 group-hover/cta:scale-x-100" />

                {/* Subtle blueprint-style dot grid — echoes the technical
                    drawing aesthetic without competing with content. */}
                <BlueprintDots />

                {/* Header row: monospace spec number on the left, diagonal
                    "navigate-to" arrow on the right. */}
                <div className="relative flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-deep/40 dark:text-foreground/40">
                    {card.number}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-brand-deep/40 transition-all duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5 group-hover/cta:text-brand-accent dark:text-foreground/40" />
                </div>

                {/* Icon tile — soft tint at rest, brand-accent on hover. */}
                <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-deep/5 text-brand-deep transition-colors duration-300 group-hover/cta:bg-brand-accent/10 group-hover/cta:text-brand-accent dark:bg-foreground/5 dark:text-foreground">
                  <Icon className="h-5 w-5" />
                </div>

                {/* Title + description */}
                <div className="relative space-y-1.5">
                  <h3 className="text-lg font-semibold tracking-tight text-brand-deep transition-colors duration-300 group-hover/cta:text-brand-accent dark:text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

function BlueprintDots() {
  // SVG dot grid layered behind card content — visually echoes blueprints /
  // technical drawings, fitting the oil & gas brand. Soft enough not to fight
  // for attention, slightly stronger on hover.
  return (
    <svg
      role="presentation"
      className="pointer-events-none absolute inset-0 h-full w-full text-brand-deep/4 transition-opacity duration-300 group-hover/cta:text-brand-accent/6 dark:text-foreground/4"
      aria-hidden
    >
      <defs>
        <pattern id="sidepanel-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sidepanel-dots)" />
    </svg>
  );
}
