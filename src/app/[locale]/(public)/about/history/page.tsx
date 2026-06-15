import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { HistoryTimeline } from "@/components/public/about/history-timeline";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { SectionIndex } from "@/components/public/landing/section-index";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { getAboutSubPage, getHistory } from "@/lib/cms/about";
import type { Locale } from "@/lib/cms/localize";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";

interface PageParams {
  locale: string;
}

function toLocale(locale: string): Locale {
  return locale === "en" ? "en" : "id";
}

export default async function HistoryPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const safeLocale = toLocale(locale);
  const t = await getTranslations("SectionTitles");
  const tAbout = await getTranslations("About");
  const [entries, meta] = await Promise.all([
    getHistory(safeLocale),
    getAboutSubPage("history", safeLocale),
  ]);

  if (meta.status === "hidden") notFound();

  const hero = resolveHero({
    mode: meta.heroMode,
    hero: meta.hero,
    defaults: { eyebrow: t("aboutEyebrow"), title: t("historyTitle"), subtitle: "" },
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
      <SectionIndex value="03" />
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

      {entries.length === 0 ? (
        <ScrollReveal>
          <p className="py-10 text-center text-sm text-muted-foreground">
            {tAbout("historyEmpty")}
          </p>
        </ScrollReveal>
      ) : (
        <HistoryTimeline entries={entries} />
      )}
    </div>
  );
}
