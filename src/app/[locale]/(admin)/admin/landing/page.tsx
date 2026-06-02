import { AdminPageHeader } from "@/components/admin/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connectDB } from "@/lib/db";
import { HOME_HERO_ID, HomeHero, ReachPoint, Stat } from "@/models";
import { STAT_ICONS, type StatIcon } from "@/models/constants";
import { HeroForm } from "./hero-form";
import { ReachManager } from "./reach-manager";
import { StatsManager } from "./stats-manager";

async function loadAll() {
  await connectDB();
  const [heroDoc, stats, reach] = await Promise.all([
    HomeHero.findById(HOME_HERO_ID).lean(),
    Stat.find().sort({ order: 1 }).lean(),
    ReachPoint.find().sort({ order: 1 }).lean(),
  ]);

  const hero = heroDoc ?? {
    eyebrow: { id: "", en: "" },
    title: { id: "", en: "" },
    subtitle: { id: "", en: "" },
    ctaLabel: { id: "Hubungi Kami", en: "Contact Us" },
    ctaHref: "/contact",
    secondaryCtaLabel: { id: "", en: "" },
    secondaryCtaHref: "",
    backgroundImage: "/images/landing/hero-placeholder.jpg",
  };

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
  };
}

export default async function LandingAdminPage() {
  const data = await loadAll();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Landing Page"
        description="Edit content shown on the public homepage. Changes apply immediately after saving."
      />
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-fit">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="stats">Quick Stats</TabsTrigger>
          <TabsTrigger value="reach">Our Reach</TabsTrigger>
        </TabsList>
        <TabsContent value="hero" className="mt-6">
          <HeroForm initial={data.hero} />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <StatsManager initial={data.stats} />
        </TabsContent>
        <TabsContent value="reach" className="mt-6">
          <ReachManager initial={data.reach} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
