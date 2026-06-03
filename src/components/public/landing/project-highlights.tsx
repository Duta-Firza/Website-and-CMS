import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/public/projects/project-card";
import { buttonVariants } from "@/components/ui/button";
import type { ProjectHighlightData } from "@/lib/cms/home";

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
    <section className="bg-muted/40">
      <div className="container mx-auto px-4 py-20 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {t("projectHighlights")}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{t("projectHighlightsSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              fallbackBadge={t("caseStudy")}
              viewProjectLabel={tProjects("viewProject")}
            />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href={`/${locale}/solutions/epc`}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {tCommon("seeMore")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
