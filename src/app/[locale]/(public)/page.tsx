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
      {/* Cohesive base shared by every section: soft gradient orbs (colour
          concentrated toward the centre-right, fading gently — no hard
          top→bottom darkening) plus a continuous dot-grid. Drawn once here so it
          never resets at a boundary; sections are transparent so it shows
          through. Each section then layers its own unique <SectionAccent /> on
          top for differentiation. */}
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          {/* Gradient orbs — soft blurred circles in the brand palette. */}
          {/* <div className="absolute -top-28 -left-24 size-128 rounded-full bg-brand-deep/7 blur-3xl dark:bg-brand-primary/12" /> */}
          <div className="absolute top-[32%] -right-20 size-176 rounded-full bg-brand-primary/14 blur-3xl dark:bg-brand-primary/20" />
          <div className="absolute -bottom-28 -left-20 size-144 rounded-full bg-brand-primary/9 blur-3xl dark:bg-brand-primary/12" />
          {/* Continuous dot-grid spanning all sections (echoes the hero). */}
          <svg
            className="absolute inset-0 h-full w-full text-brand-deep/10 dark:text-foreground/5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="home-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#home-dot-grid)" />
          </svg>
        </div>
        <SolutionsSpotlight
          solutions={solutions}
          titleOverride={hero.solutionsTitle}
          subtitleOverride={hero.solutionsSubtitle}
          columnsPerRow={hero.solutionsColumnsPerRow}
        />
        <PartnersCarousel
          partners={partners}
          titleOverride={hero.partnersTitle}
          subtitleOverride={hero.partnersSubtitle}
        />
        <ProjectHighlights
          projects={projects}
          titleOverride={hero.projectsTitle}
          subtitleOverride={hero.projectsSubtitle}
        />
        <ReachMap
          reachPoints={reachPoints}
          titleOverride={hero.reachTitle}
          subtitleOverride={hero.reachSubtitle}
        />
        <CustomersCarousel customers={customers} titleOverride={hero.customersTitle} />
      </div>
      <ScrollToTop />
    </>
  );
}
