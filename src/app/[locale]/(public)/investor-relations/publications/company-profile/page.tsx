import { Download } from "lucide-react";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { PageHeader } from "@/components/public/section/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getCompanyProfileUrl, getIrSubPage } from "@/lib/cms/investor-relations";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";

function toLocale(l: string): "id" | "en" {
  return l === "en" ? "en" : "id";
}

interface PageParams { locale: string }

export default async function CompanyProfilePage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const safeLocale = toLocale(locale);

  const [tSec, tIR, meta, profileUrl] = await Promise.all([
    getTranslations("SectionTitles"),
    getTranslations("IR"),
    getIrSubPage("company-profile", safeLocale),
    getCompanyProfileUrl(),
  ]);

  if (meta.status === "hidden") notFound();

  const hero = resolveHero({
    mode: meta.heroMode,
    hero: meta.hero,
    defaults: {
      eyebrow: tSec("investorRelationsEyebrow"),
      title: tSec("companyProfileTitle"),
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
        {profileUrl ? (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <iframe
                src={`${profileUrl}#toolbar=0`}
                className="h-[70vh] w-full"
                title={tSec("companyProfileTitle")}
              />
            </div>
            <div className="flex justify-center">
              <a
                href={profileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "brand", size: "lg" })}
              >
                <Download className="mr-2 h-4 w-4" />
                {tIR("downloadProfile")}
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-muted/30 p-10 text-center">
            <p className="text-sm text-muted-foreground">{tIR("noProfileYet")}</p>
          </div>
        )}
      </ScrollReveal>
    </>
  );
}
