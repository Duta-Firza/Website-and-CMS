import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectDB } from "@/lib/db";
import { HOME_HERO_ID, HomeHero, ReachPoint, Solution, Stat } from "@/models";
import { SOLUTION_KEYS, type SolutionKey, STAT_ICONS, type StatIcon } from "@/models/constants";
import { HeroForm } from "./hero-form";
import { ReachManager } from "./reach-manager";
import { SolutionForm } from "./solution-card-form";
import { StatsManager } from "./stats-manager";

async function loadAll() {
  await connectDB();
  const [heroDoc, stats, reach, solutionDocs] = await Promise.all([
    HomeHero.findById(HOME_HERO_ID).lean(),
    Stat.find().sort({ order: 1 }).lean(),
    ReachPoint.find().sort({ order: 1 }).lean(),
    Solution.find().sort({ order: 1 }).lean(),
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

  // Ensure all 3 Solution keys are present (with defaults) so admin can edit
  // before the seed has run.
  const byKey = new Map<SolutionKey, (typeof solutionDocs)[number]>();
  for (const d of solutionDocs) byKey.set(d.key as SolutionKey, d);
  const solutions = SOLUTION_KEYS.map((key, idx) => {
    const doc = byKey.get(key);
    return {
      id: doc ? String(doc._id) : undefined,
      key,
      title: doc?.title ?? empty,
      description: doc?.description ?? empty,
      iconName: doc?.iconName ?? defaultIcon(key),
      href: doc?.href ?? `/id/solutions/${key}`,
      order: doc?.order ?? idx,
    };
  });

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
      backgroundImage: hero.backgroundImage,
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
    solutions,
  };
}

function defaultIcon(key: SolutionKey): string {
  if (key === "trading") return "Handshake";
  if (key === "manufacturing") return "Factory";
  return "HardHat";
}

// Tab order mirrors the public homepage section order: Hero → Stats →
// Partners → Solutions → Reach. Partners is delegated to the master partners
// CMS (Solutions / Trading / Partners). Projects + Customers aren't editable
// from this page yet, so they stay out of the tab list.
const LANDING_SECTIONS = ["hero", "stats", "partners", "solutions", "reach"] as const;
type LandingSection = (typeof LANDING_SECTIONS)[number];

interface Props {
  searchParams: Promise<{ section?: string }>;
}

export default async function LandingAdminPage({ searchParams }: Props) {
  const { section } = await searchParams;
  const defaultTab: LandingSection = (LANDING_SECTIONS as readonly string[]).includes(section ?? "")
    ? (section as LandingSection)
    : "hero";
  const [data, locale, t] = await Promise.all([loadAll(), getLocale(), getTranslations("Admin")]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.landing.title")}
        description={t("pages.landing.description")}
      />
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-fit md:grid-cols-5">
          <TabsTrigger value="hero">{t("tabs.hero")}</TabsTrigger>
          <TabsTrigger value="stats">{t("tabs.stats")}</TabsTrigger>
          <TabsTrigger value="partners">{t("tabs.partners")}</TabsTrigger>
          <TabsTrigger value="solutions">{t("tabs.solutions")}</TabsTrigger>
          <TabsTrigger value="reach">{t("tabs.reach")}</TabsTrigger>
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {data.solutions.map((s) => (
              <SolutionForm key={s.key} initial={s} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="reach" className="mt-6">
          <ReachManager initial={data.reach} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
