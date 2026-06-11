import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { HistoryTimeline } from "@/components/public/about/history-timeline";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { SectionIndex } from "@/components/public/landing/section-index";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { getAboutPage, getAboutSubPage, getHistory } from "@/lib/cms/about";
import type { Locale } from "@/lib/cms/localize";

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
  const [entries, about, meta] = await Promise.all([
    getHistory(safeLocale),
    getAboutPage(safeLocale),
    getAboutSubPage("history", safeLocale),
  ]);

  if (meta.status === "hidden") notFound();

  const eyebrow = meta.hero.eyebrow || t("aboutEyebrow");
  const title = meta.hero.title || about.historyTitle?.trim() || t("historyTitle");
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
      <SectionIndex value="03" />
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
