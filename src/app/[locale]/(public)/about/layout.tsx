import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { buildNav } from "@/components/layout/main-nav";
import { SectionPattern } from "@/components/public/landing/section-pattern";
// Alternative pattern variants — swap the import below to try a different
// backdrop style across all About sub-pages:
  // import { SectionPatternGrid as SectionPattern } from "@/components/public/landing/section-pattern-grid";
  // import { SectionPatternDiagonal as SectionPattern } from "@/components/public/landing/section-pattern-diagonal";
import { SectionLayout } from "@/components/public/section/section-layout";

/**
 * About-section shell.
 *
 * The pattern is lifted from each page into this layout so it covers the full
 * vertical span between the public navbar and footer — including the empty
 * room above the PageHeader and below short content. The inner SectionLayout
 * keeps its own `container` + `py-12 md:py-16` padding, so the actual content
 * always sits visually inset from the pattern edges.
 */
export default async function AboutLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const section = buildNav(locale).find((n) => n.labelKey === "about");
  if (!section) notFound();
  return (
    <div className="relative flex flex-1 flex-col">
      <SectionPattern />
      <SectionLayout section={section}>{children}</SectionLayout>
    </div>
  );
}
