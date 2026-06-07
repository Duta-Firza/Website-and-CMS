import { getTranslations } from "next-intl/server";
import { LeadershipSection } from "@/components/public/about/leadership-section";
import { SectionIndex } from "@/components/public/landing/section-index";
import { PageHeader } from "@/components/public/section/page-header";
import { getAboutPage, getLeadership } from "@/lib/cms/about";
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
  const [directors, commissioners, about] = await Promise.all([
    getLeadership(safeLocale, "director"),
    getLeadership(safeLocale, "commissioner"),
    getAboutPage(safeLocale),
  ]);

  return (
    <div className="relative">
      <SectionIndex value="02" />
      <PageHeader
        eyebrow={titles("aboutEyebrow")}
        title={about.leadershipTitle?.trim() || titles("leadershipTitle")}
      />

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
