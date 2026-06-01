import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { ProjectHighlightData } from "@/lib/cms/home";

interface Props {
  projects: ProjectHighlightData[];
}

export async function ProjectHighlights({ projects }: Props) {
  const t = await getTranslations("Landing");
  const tCommon = await getTranslations("Common");
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
            <article
              key={project.id}
              className="group/proj flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-16/10 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover/proj:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <Badge
                  variant="outline"
                  className="self-start text-[10px] uppercase tracking-wider"
                >
                  {project.client || t("caseStudy")}
                </Badge>
                <h3 className="text-lg font-semibold leading-snug text-brand-deep dark:text-foreground">
                  {project.title}
                </h3>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {project.summary}
                </p>
              </div>
            </article>
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
