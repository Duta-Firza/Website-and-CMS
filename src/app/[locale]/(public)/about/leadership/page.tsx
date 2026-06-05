import { getTranslations } from "next-intl/server";
import { LeadershipSection } from "@/components/public/about/leadership-section";
import { SectionIndex } from "@/components/public/landing/section-index";
import { SectionPattern } from "@/components/public/landing/section-pattern";
import { PageHeader } from "@/components/public/section/page-header";
import { getLeadership } from "@/lib/cms/about";
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
  const [directors, commissioners] = await Promise.all([
    getLeadership(safeLocale, "director"),
    getLeadership(safeLocale, "commissioner"),
  ]);

  return (
    <div className="relative">
      <SectionPattern />
      <SectionIndex value="02" />
      <div className="relative">
        <PageHeader eyebrow={titles("aboutEyebrow")} title={titles("leadershipTitle")} />

        <LeadershipSection
          groups={[
            {
              label: tAbout("boardOfDirectors"),
              members: directors,
              emptyMessage: tAbout("leadershipEmpty"),
            },
            {
              label: tAbout("boardOfCommissioners"),
              members: commissioners,
              emptyMessage: tAbout("leadershipEmpty"),
            },
          ]}
        />
      </div>
    </div>
  );
}
