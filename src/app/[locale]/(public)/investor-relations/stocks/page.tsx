import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { PageHeader } from "@/components/public/section/page-header";
import { getIrSubPage } from "@/lib/cms/investor-relations";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";

function toLocale(l: string): "id" | "en" {
  return l === "en" ? "en" : "id";
}

interface PageParams { locale: string }

export default async function StocksPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const safeLocale = toLocale(locale);
  const [t, meta] = await Promise.all([
    getTranslations("SectionTitles"),
    getIrSubPage("stocks", safeLocale),
  ]);

  if (meta.status === "hidden") notFound();

  const hero = resolveHero({
    mode: meta.heroMode,
    hero: meta.hero,
    defaults: {
      eyebrow: t("investorRelationsEyebrow"),
      title: t("stocksTitle"),
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

      <ScrollReveal className="mb-12">
        <div className="rounded-xl border bg-muted/30 p-6 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-semibold text-brand-deep dark:text-foreground">IDX Code</p>
              <p className="text-muted-foreground">DFIR (Placeholder)</p>
            </div>
            <div>
              <p className="font-semibold text-brand-deep dark:text-foreground">Market</p>
              <p className="text-muted-foreground">Indonesia Stock Exchange (IDX)</p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </>
  );
}
