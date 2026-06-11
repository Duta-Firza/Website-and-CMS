import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LeadershipSection } from "@/components/public/about/leadership-section";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { SectionIndex } from "@/components/public/landing/section-index";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { getAboutPage, getAboutSubPage, getLeadership } from "@/lib/cms/about";
import type { Locale } from "@/lib/cms/localize";

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

  const eyebrow = meta.hero.eyebrow || titles("aboutEyebrow");
  const title = meta.hero.title || about.leadershipTitle?.trim() || titles("leadershipTitle");
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
      <SectionIndex value="02" />
      <PageHeader eyebrow={eyebrow} title={title} description={subtitle} />

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
