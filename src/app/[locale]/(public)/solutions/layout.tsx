import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { buildNav } from "@/components/layout/main-nav";
import { SectionLayout } from "@/components/public/section/section-layout";

export default async function SolutionsLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const section = buildNav(locale).find((n) => n.labelKey === "solutions");
  if (!section) notFound();
  return <SectionLayout section={section}>{children}</SectionLayout>;
}
