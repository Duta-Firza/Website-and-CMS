import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { buildNav } from "@/components/layout/main-nav";
import { SectionLayout } from "@/components/public/section/section-layout";
import { SectionPattern } from "@/components/public/landing/section-pattern";

export default async function InvestorRelationsLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const section = buildNav(locale).find((n) => n.labelKey === "investorRelations");
  if (!section) notFound();
  return (
      <div className="relative flex flex-1 flex-col">
        <SectionPattern />
        <SectionLayout section={section}>{children}</SectionLayout>
      </div>
    );
}
