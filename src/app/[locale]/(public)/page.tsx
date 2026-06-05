import { CustomersCarousel } from "@/components/public/landing/customers-carousel";
import { HeroSection } from "@/components/public/landing/hero-section";
import { PartnersCarousel } from "@/components/public/landing/partners-carousel";
import { ProjectHighlights } from "@/components/public/landing/project-highlights";
import { QuickStats } from "@/components/public/landing/quick-stats";
import { ReachMap } from "@/components/public/landing/reach-map";
import { ScrollToTop } from "@/components/public/landing/scroll-to-top";
import { SolutionsSpotlight } from "@/components/public/landing/solutions-spotlight";
import {
  getActivePartners,
  getCustomers,
  getHighlightedProjects,
  getHomeHero,
  getReachPoints,
  getSolutions,
  getStats,
} from "@/lib/cms/home";
import type { Locale } from "@/lib/cms/localize";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (locale === "en" ? "en" : "id") as Locale;

  const [hero, stats, partners, solutions, projects, reachPoints, customers] = await Promise.all([
    getHomeHero(safeLocale),
    getStats(safeLocale),
    getActivePartners(safeLocale),
    getSolutions(safeLocale),
    getHighlightedProjects(safeLocale),
    getReachPoints(),
    getCustomers(),
  ]);

  return (
    <>
      {/* Pulls the hero up under the transparent navbar reserved by the public layout */}
      <div className="-mt-16">
        <HeroSection hero={hero} />
      </div>
      <QuickStats stats={stats} />
      <PartnersCarousel partners={partners} />
      <SolutionsSpotlight solutions={solutions} />
      <ProjectHighlights projects={projects} />
      <ReachMap reachPoints={reachPoints} />
      <CustomersCarousel customers={customers} />
      <ScrollToTop />
    </>
  );
}
