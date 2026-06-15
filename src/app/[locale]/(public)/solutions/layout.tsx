import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { applyVisibilityToNav, buildNav } from "@/components/layout/main-nav";
import { SectionLayout } from "@/components/public/section/section-layout";
import { getSolutionPageVisibilityMap } from "@/lib/cms/solutions";
import { SectionPattern } from "@/components/public/landing/section-pattern";

export default async function SolutionsLayout({ children }: { children: React.ReactNode }) {
  const [locale, visibility] = await Promise.all([getLocale(), getSolutionPageVisibilityMap()]);
  const section = applyVisibilityToNav(buildNav(locale), visibility).find(
    (n) => n.labelKey === "solutions",
  );
  if (!section) notFound();
  return (
    <div className="relative flex flex-1 flex-col">
      <SectionPattern />
      <SectionLayout section={section}>{children}</SectionLayout>
    </div>
  );
}
