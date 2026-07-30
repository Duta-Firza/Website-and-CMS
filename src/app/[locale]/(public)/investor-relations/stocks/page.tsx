import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { ShareholdersTable } from "@/components/public/ir/shareholders-table";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { getIrSubPage, getStocksShareholders } from "@/lib/cms/investor-relations";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";

function toLocale(l: string): "id" | "en" {
  return l === "en" ? "en" : "id";
}

interface PageParams {
  locale: string;
}

export default async function StocksPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const safeLocale = toLocale(locale);
  const [t, tIR, meta, shareholders] = await Promise.all([
    getTranslations("SectionTitles"),
    getTranslations("IR"),
    getIrSubPage("stocks", safeLocale),
    getStocksShareholders(safeLocale),
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
        {/* No `message`: the body is now rich-text HTML, and ComingSoonPage
            renders that prop as plain text — tags and all. */}
        <ComingSoonPage eyebrow={hero?.eyebrow} title={body?.heading || undefined} />
      </>
    );
  }

  const hasTable =
    shareholders.enabled && shareholders.columns.length > 0 && shareholders.rows.length > 0;

  return (
    <>
      {hero && <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />}
      {body && (body.heading || body.content) && (
        <ScrollReveal className="mb-10 max-w-3xl space-y-3">
          {body.heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
              {body.heading}
            </h2>
          )}
          {body.content && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: CMS rich-text body is admin-authored
              dangerouslySetInnerHTML={{ __html: body.content }}
            />
          )}
        </ScrollReveal>
      )}

      {hasTable && (
        <ScrollReveal className="mb-12">
          <ShareholdersTable data={shareholders} fallbackHeading={tIR("shareholdersHeading")} />
        </ScrollReveal>
      )}
    </>
  );
}
