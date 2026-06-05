import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/public/projects/project-card";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import type { ProjectHighlightData } from "@/lib/cms/home";
import { SectionIndex } from "./section-index";
import { SectionPattern } from "./section-pattern";

interface Props {
  projects: ProjectHighlightData[];
}

export async function ProjectHighlights({ projects }: Props) {
  const t = await getTranslations("Landing");
  const tCommon = await getTranslations("Common");
  const tProjects = await getTranslations("Projects");
  const locale = await getLocale();
  if (projects.length === 0) return null;

  return (
    <section className="relative">
      <SectionPattern />
      {/* <SectionIndex value="03" /> */}
      <div className="container relative mx-auto px-4 py-20 md:py-24">
        <ScrollReveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="h-0.75 w-10 bg-brand-accent" aria-hidden />
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {t("projectHighlights")}
          </h2>
          <p className="text-base text-muted-foreground">{t("projectHighlightsSubtitle")}</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, idx) => (
            <ScrollReveal key={project.id} delay={idx * 100}>
              <ProjectCard
                project={project}
                locale={locale}
                fallbackBadge={t("caseStudy")}
                viewProjectLabel={tProjects("viewProject")}
              />
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={200} className="mt-10 flex justify-center">
          <Link
            href={`/${locale}/solutions/epc`}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {tCommon("seeMore")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
