import type { ReactNode } from "react";
import type { NavTop } from "@/components/layout/main-nav";
import { SectionSidebar } from "./section-sidebar";

interface Props {
  section: NavTop;
  children: ReactNode;
}

/**
 * Two-column shell for public section pages: sidebar nav on the left,
 * page content on the right. Sidebar collapses below md.
 */
export function SectionLayout({ section, children }: Props) {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="md:grid md:grid-cols-[160px_1fr] md:gap-8 lg:grid-cols-[176px_1fr] lg:gap-10">
        <SectionSidebar section={section} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
