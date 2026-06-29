import { ArrowRight, Briefcase, ExternalLink, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCareerPage, getPublishedJobOpenings } from "@/lib/cms/careers";
import type { Locale } from "@/lib/cms/localize";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";
import { pickIcon } from "@/lib/icon-map";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SectionTitles");
  return { title: t("careersTitle") };
}

export default async function CareersPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, openings, tTitles, t] = await Promise.all([
    getCareerPage(locale),
    getPublishedJobOpenings(locale),
    getTranslations("SectionTitles"),
    getTranslations("Careers"),
  ]);

  if (page.status === "hidden") notFound();

  const hero = resolveHero({
    mode: page.heroMode,
    hero: page.hero,
    defaults: {
      eyebrow: tTitles("contactEyebrow"),
      title: tTitles("careersTitle"),
      subtitle: "",
    },
  });
  const body = resolveBody({
    mode: page.bodyMode,
    body: page.body,
    defaults: { heading: "", content: "" },
  });
  const whyJoin = resolveBody({
    mode: page.whyJoinMode,
    body: page.whyJoin,
    defaults: { heading: "", content: "" },
  });

  if (page.status === "comingSoon") {
    return (
      <>
        {hero && (
          <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />
        )}
        <ComingSoonPage eyebrow={hero?.eyebrow} title={hero?.title} />
      </>
    );
  }

  const boards = page.jobBoards.filter((b) => Boolean(b.url));

  return (
    <>
      {hero && <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />}

      {body && (body.heading || body.content) && (
        <ScrollReveal className="mb-12 max-w-3xl space-y-3">
          {body.heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
              {body.heading}
            </h2>
          )}
          {body.content && (
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {body.content}
            </p>
          )}
        </ScrollReveal>
      )}

      {/* Job boards */}
      {page.showJobBoards && boards.length > 0 && (
        <ScrollReveal className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
            {t("findUsOn")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {boards.map((b) => (
              <a
                key={b.key || b.label}
                href={b.url}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonVariants({ variant: "outline" })}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {b.label}
              </a>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Why join us */}
      {whyJoin && (whyJoin.heading || whyJoin.content) && (
        <ScrollReveal className="mt-12 max-w-3xl space-y-3">
          {whyJoin.heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
              {whyJoin.heading}
            </h2>
          )}
          {whyJoin.content && (
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {whyJoin.content}
            </p>
          )}
        </ScrollReveal>
      )}

      {/* Benefits */}
      {page.showBenefits && page.benefits.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.benefits.map((benefit, i) => {
            const Icon = pickIcon(benefit.icon);
            return (
              <ScrollReveal
                key={`${benefit.icon}-${benefit.title}`}
                delay={i * 60}
                className="rounded-xl border bg-card p-6"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-brand-deep dark:text-foreground">
                  {benefit.title}
                </h3>
                {benefit.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                )}
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* Open positions */}
      {page.showOpenings && (
        <ScrollReveal className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
            {t("openPositions")}
          </h2>
          {openings.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-card/50 px-6 py-10 text-center text-sm text-muted-foreground">
              {t("noOpenings")}
            </p>
          ) : (
            <div className="space-y-3">
              {openings.map((job) => (
                <div key={job.id} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <h3 className="font-semibold text-brand-deep dark:text-foreground">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">{t(`empType.${job.employmentType}`)}</Badge>
                        {job.department && (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {job.department}
                          </span>
                        )}
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        )}
                      </div>
                      {job.summary && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {job.summary}
                        </p>
                      )}
                    </div>
                    {job.applyUrl && (
                      <Link
                        href={job.applyUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={buttonVariants({ variant: "brand", className: "shrink-0" })}
                      >
                        {t("apply")}
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    )}
                  </div>
                  {job.description && (
                    <Accordion className="mt-3 border-t pt-1">
                      <AccordionItem value="desc" className="border-b-0">
                        <AccordionTrigger className="font-medium text-brand-accent hover:no-underline">
                          {t("viewDescription")}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none"
                            // biome-ignore lint/security/noDangerouslySetInnerHtml: CMS rich-text is admin-authored
                            dangerouslySetInnerHTML={{ __html: job.description }}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>
      )}
    </>
  );
}
