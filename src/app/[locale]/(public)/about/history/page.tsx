import { getTranslations } from "next-intl/server";
import { HistoryTimeline } from "@/components/public/about/history-timeline";
import { SectionIndex } from "@/components/public/landing/section-index";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { getHistory } from "@/lib/cms/about";
import type { Locale } from "@/lib/cms/localize";

interface PageParams {
  locale: string;
}

function toLocale(locale: string): Locale {
  return locale === "en" ? "en" : "id";
}

export default async function HistoryPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const t = await getTranslations("SectionTitles");
  const tAbout = await getTranslations("About");
  const entries = await getHistory(toLocale(locale));

  return (
    <div className="relative">
      <SectionIndex value="03" />
      <PageHeader eyebrow={t("aboutEyebrow")} title={t("historyTitle")} />

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
