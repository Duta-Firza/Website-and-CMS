import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { PageHeader } from "@/components/public/section/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getIrSubPage, getPublications } from "@/lib/cms/investor-relations";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";

function toLocale(l: string): "id" | "en" {
  return l === "en" ? "en" : "id";
}

interface PageParams { locale: string }

export default async function PressReleasePage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const safeLocale = toLocale(locale);

  const [tSec, tIR, meta, { items: releases }] = await Promise.all([
    getTranslations("SectionTitles"),
    getTranslations("IR"),
    getIrSubPage("press-release", safeLocale),
    getPublications(safeLocale, "press-release", true),
  ]);

  if (meta.status === "hidden") notFound();

  const hero = resolveHero({
    mode: meta.heroMode,
    hero: meta.hero,
    defaults: {
      eyebrow: tSec("investorRelationsEyebrow"),
      title: tSec("pressReleaseTitle"),
      subtitle: "",
    },
  });
  const body = resolveBody({
    mode: meta.bodyMode,
    body: meta.body,
    defaults: { heading: "", content: "" },
  });

  if (meta.status === "comingSoon") {
    return (
      <>
        {hero && (
          <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />
        )}
        <ComingSoonPage
          eyebrow={hero?.eyebrow}
          title={body?.heading || undefined}
          message={body?.content || undefined}
        />
      </>
    );
  }

  return (
    <>
      {hero && (
        <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />
      )}
      {body && (body.heading || body.content) && (
        <ScrollReveal className="mb-10 max-w-3xl space-y-3">
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

      <ScrollReveal>
        {releases.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {tIR("pressReleasesEmpty")}
          </p>
        ) : (
          <div className="divide-y">
            {releases.map((rel, idx) => (
              <ScrollReveal key={rel.id} delay={idx * 40} className="py-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <p className="mb-1 text-xs text-muted-foreground">
                      {new Date(rel.publishedAt).toLocaleDateString(
                        locale === "id" ? "id-ID" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </p>
                    <h3 className="text-base font-semibold leading-snug text-brand-deep dark:text-foreground">
                      {rel.title}
                    </h3>
                    {rel.summary && (
                      <p className="mt-1 text-sm text-muted-foreground">{rel.summary}</p>
                    )}
                  </div>
                  {rel.originalUrl && (
                    <a
                      href={rel.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      {tIR("readMore")}
                    </a>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </ScrollReveal>
    </>
  );
}
