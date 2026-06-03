import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/public/projects/project-card";
import { Badge } from "@/components/ui/badge";
import { getOtherProjects, getProjectBySlug } from "@/lib/cms/home";
import type { Locale } from "@/lib/cms/localize";

interface PageParams {
  locale: string;
  slug: string;
}

function toLocale(locale: string): Locale {
  return locale === "en" ? "en" : "id";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const project = await getProjectBySlug(toLocale(locale), slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const { slug, locale } = await params;
  const safeLocale = toLocale(locale);
  const project = await getProjectBySlug(safeLocale, slug);
  if (!project) notFound();

  const others = await getOtherProjects(safeLocale, slug, 3);
  const t = await getTranslations("Projects");
  const tLanding = await getTranslations("Landing");
  const scopeItems = project.scopeOfWork
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <article className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
          {project.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="uppercase tracking-wider">
            {project.category}
          </Badge>
          {project.client && (
            <Badge variant="secondary">
              {t("client")}: {project.client}
            </Badge>
          )}
          {project.year && (
            <Badge variant="secondary">
              {t("year")}: {project.year}
            </Badge>
          )}
        </div>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
          {project.summary}
        </p>
      </header>

      <div className="relative aspect-video overflow-hidden rounded-xl border">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover"
          priority
        />
      </div>

      {project.about && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-brand-deep dark:text-foreground">
            {t("aboutTheProject")}
          </h2>
          <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
            {project.about}
          </p>
        </section>
      )}

      {scopeItems.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-brand-deep dark:text-foreground">
            {t("scopeOfWork")}
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-base leading-relaxed text-muted-foreground">
            {scopeItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section className="space-y-6 border-t pt-10">
          <h2 className="text-2xl font-semibold text-brand-deep dark:text-foreground">
            {t("seeMoreProjects")}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => (
              <ProjectCard
                key={other.id}
                project={other}
                locale={locale}
                fallbackBadge={tLanding("caseStudy")}
                viewProjectLabel={t("viewProject")}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
