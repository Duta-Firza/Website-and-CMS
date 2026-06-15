import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LeadershipSection } from "@/components/public/about/leadership-section";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { SectionIndex } from "@/components/public/landing/section-index";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { getAboutPage, getAboutSubPage, getLeadership } from "@/lib/cms/about";
import type { Locale } from "@/lib/cms/localize";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";

interface Props {
  params: Promise<{ locale: string }>;
}

function toLocale(locale: string): Locale {
  return locale === "en" ? "en" : "id";
}

export default async function LeadershipPage({ params }: Props) {
  const { locale } = await params;
  const safeLocale = toLocale(locale);
  const titles = await getTranslations("SectionTitles");
  const tAbout = await getTranslations("About");
  const [directors, commissioners, about, meta] = await Promise.all([
    getLeadership(safeLocale, "director"),
    getLeadership(safeLocale, "commissioner"),
    getAboutPage(safeLocale),
    getAboutSubPage("leadership", safeLocale),
  ]);

  if (meta.status === "hidden") notFound();

  const hero = resolveHero({
    mode: meta.heroMode,
    hero: meta.hero,
    defaults: { eyebrow: titles("aboutEyebrow"), title: titles("leadershipTitle"), subtitle: "" },
  });
  const body = resolveBody({
    mode: meta.bodyMode,
    body: meta.body,
    defaults: { heading: "", content: "" },
  });

  if (meta.status === "comingSoon") {
    return (
      <>
        {hero && (
          <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />
        )}
        <ComingSoonPage
          eyebrow={hero?.eyebrow}
          title={body?.heading || undefined}
          message={body?.content || undefined}
        />
      </>
    );
  }

  return (
    <div className="relative">
      <SectionIndex value="02" />
      {hero && <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />}

      {body && (body.heading || body.content) && (
        <ScrollReveal className="mb-12 max-w-3xl space-y-3">
          {body.heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
              {body.heading}
            </h2>
          )}
          {body.content && (
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {body.content}
            </p>
          )}
        </ScrollReveal>
      )}

      <LeadershipSection
        groups={[
          {
            label: about.boardOfDirectorsLabel?.trim() || tAbout("boardOfDirectors"),
            members: directors,
            emptyMessage: tAbout("leadershipEmpty"),
          },
          {
            label: about.boardOfCommissionersLabel?.trim() || tAbout("boardOfCommissioners"),
            members: commissioners,
            emptyMessage: tAbout("leadershipEmpty"),
          },
        ]}
      />
    </div>
  );
}
