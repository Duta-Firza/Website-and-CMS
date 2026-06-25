import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CustomersManager } from "@/app/[locale]/(admin)/admin/customers/customers-manager";
import type { CustomerRow } from "@/app/[locale]/(admin)/admin/customers/page";
import { AdminPageHeader } from "@/components/admin/page-header";
import { UrlTabs } from "@/components/admin/url-tabs";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectDB } from "@/lib/db";
import { Customer, HOME_HERO_ID, HomeHero, ReachPoint, Solution, Stat } from "@/models";
import { STAT_ICONS, type StatIcon } from "@/models/constants";
import { HeroForm } from "./hero-form";
import { ReachManager } from "./reach-manager";
import { SolutionsManager } from "./solutions-manager";
import { StatsManager } from "./stats-manager";

async function loadAll() {
  await connectDB();
  const [heroDoc, stats, reach, solutionDocs, customerDocs] = await Promise.all([
    HomeHero.findById(HOME_HERO_ID).lean(),
    Stat.find().sort({ order: 1 }).lean(),
    ReachPoint.find().sort({ order: 1 }).lean(),
    Solution.find().sort({ order: 1 }).lean(),
    Customer.find().sort({ order: 1 }).lean(),
  ]);

  const empty = { id: "", en: "" };
  const hero = heroDoc ?? {
    eyebrow: empty,
    title: empty,
    subtitle: empty,
    ctaLabel: { id: "Hubungi Kami", en: "Contact Us" },
    ctaHref: "/contact",
    secondaryCtaLabel: empty,
    secondaryCtaHref: "",
    backgroundImage: "/images/landing/hero-placeholder.jpg",
    solutionsColumnsPerRow: 3,
  };
  const pickLocalized = (field: unknown): { id: string; en: string } => {
    if (field && typeof field === "object") {
      const f = field as { id?: unknown; en?: unknown };
      return {
        id: typeof f.id === "string" ? f.id : "",
        en: typeof f.en === "string" ? f.en : "",
      };
    }
    return empty;
  };

  const solutions = solutionDocs.map((doc, idx) => ({
    id: String(doc._id),
    key: doc.key,
    title: pickLocalized(doc.title),
    description: pickLocalized(doc.description),
    iconName: doc.iconName ?? "Box",
    href: doc.href ?? `/solutions/${doc.key}`,
    order: doc.order ?? idx,
    isActive: doc.isActive ?? true,
  }));

  return {
    hero: {
      eyebrow: {
        id: hero.eyebrow?.id ?? "",
        en: hero.eyebrow?.en ?? "",
      },
      title: { id: hero.title.id, en: hero.title.en },
      subtitle: { id: hero.subtitle.id, en: hero.subtitle.en },
      ctaLabel: { id: hero.ctaLabel.id, en: hero.ctaLabel.en },
      ctaHref: hero.ctaHref,
      secondaryCtaLabel: {
        id: hero.secondaryCtaLabel?.id ?? "",
        en: hero.secondaryCtaLabel?.en ?? "",
      },
      secondaryCtaHref: hero.secondaryCtaHref ?? "",
      backgroundImage:
        hero.backgroundImage && hero.backgroundImage.startsWith("http")
          ? hero.backgroundImage
          : "",
      heroDecorations: heroDoc?.heroDecorations ?? true,
      partnersTitle: pickLocalized(heroDoc?.partnersTitle),
      partnersSubtitle: pickLocalized(heroDoc?.partnersSubtitle),
      solutionsTitle: pickLocalized(heroDoc?.solutionsTitle),
      solutionsSubtitle: pickLocalized(heroDoc?.solutionsSubtitle),
      projectsTitle: pickLocalized(heroDoc?.projectsTitle),
      projectsSubtitle: pickLocalized(heroDoc?.projectsSubtitle),
      reachTitle: pickLocalized(heroDoc?.reachTitle),
      reachSubtitle: pickLocalized(heroDoc?.reachSubtitle),
      customersTitle: pickLocalized(heroDoc?.customersTitle),
    },
    stats: stats.map((s) => ({
      id: String(s._id),
      label: { id: s.label.id, en: s.label.en },
      prefix: s.prefix ?? "",
      value: s.value,
      suffix: s.suffix ?? "",
      order: s.order ?? 0,
      iconName: ((STAT_ICONS as readonly string[]).includes(s.iconName)
        ? s.iconName
        : "ChartBar") as StatIcon,
    })),
    reach: reach.map((r) => ({
      id: String(r._id),
      city: r.city,
      province: r.province,
      latitude: r.latitude,
      longitude: r.longitude,
      order: r.order ?? 0,
    })),
    solutionsColumnsPerRow: heroDoc?.solutionsColumnsPerRow ?? 3,
    solutions,
    customers: customerDocs.map(
      (c): CustomerRow => ({
        id: String(c._id),
        name: c.name,
        logoUrl: c.logoUrl,
        order: c.order ?? 0,
        invertOnDark: c.invertOnDark ?? false,
        isActive: c.isActive ?? true,
      }),
    ),
  };
}

// Tab order mirrors the public homepage section order: Hero → Stats →
// Partners → Solutions → Reach → Customers. Partners is delegated to the
// master Partners CMS (Solutions / Trading / Partners). Projects isn't
// editable from this page yet, so it stays out of the tab list.
const LANDING_SECTIONS = ["hero", "stats", "partners", "solutions", "reach", "customers"] as const;

export default async function LandingAdminPage() {
  const [data, locale, t] = await Promise.all([loadAll(), getLocale(), getTranslations("Admin")]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.landing.title")}
        description={t("pages.landing.description")}
      />
      <UrlTabs defaultTab="hero" validValues={LANDING_SECTIONS} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-fit md:grid-cols-6">
          <TabsTrigger value="hero">{t("tabs.hero")}</TabsTrigger>
          <TabsTrigger value="stats">{t("tabs.stats")}</TabsTrigger>
          <TabsTrigger value="partners">{t("tabs.partners")}</TabsTrigger>
          <TabsTrigger value="solutions">{t("tabs.solutions")}</TabsTrigger>
          <TabsTrigger value="reach">{t("tabs.reach")}</TabsTrigger>
          <TabsTrigger value="customers">{t("tabs.customers")}</TabsTrigger>
        </TabsList>
        <TabsContent value="hero" className="mt-6">
          <HeroForm initial={data.hero} />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <StatsManager initial={data.stats} />
        </TabsContent>
        <TabsContent value="partners" className="mt-6">
          <Card className="border-dashed bg-muted/40">
            <CardContent className="flex flex-col items-start gap-3 py-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl space-y-1">
                <p className="text-sm font-medium text-brand-deep dark:text-foreground">
                  {t("helpers.landingPartnersDelegated")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("helpers.landingPartnersDelegatedHint")}
                </p>
              </div>
              <Link
                href={`/${locale}/admin/solutions/trading/partners?tab=partners`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {t("buttons.manageInPartners")}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="solutions" className="mt-6">
          <SolutionsManager initial={data.solutions} initialColumns={data.solutionsColumnsPerRow} />
        </TabsContent>
        <TabsContent value="reach" className="mt-6">
          <ReachManager initial={data.reach} />
        </TabsContent>
        <TabsContent value="customers" className="mt-6">
          <CustomersManager initial={data.customers} />
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
