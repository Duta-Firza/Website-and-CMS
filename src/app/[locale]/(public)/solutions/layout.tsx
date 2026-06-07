import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { applyVisibilityToNav, buildNav } from "@/components/layout/main-nav";
import { SectionLayout } from "@/components/public/section/section-layout";
import { getSolutionPageVisibilityMap } from "@/lib/cms/solutions";

export default async function SolutionsLayout({ children }: { children: React.ReactNode }) {
  const [locale, visibility] = await Promise.all([getLocale(), getSolutionPageVisibilityMap()]);
  const section = applyVisibilityToNav(buildNav(locale), visibility).find(
    (n) => n.labelKey === "solutions",
  );
  if (!section) notFound();
  return <SectionLayout section={section}>{children}</SectionLayout>;
}
