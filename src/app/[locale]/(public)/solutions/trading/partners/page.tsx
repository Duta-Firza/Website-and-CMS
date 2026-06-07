import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { getActivePartners } from "@/lib/cms/home";
import type { Locale } from "@/lib/cms/localize";
import { getSolutionPage } from "@/lib/cms/solutions";
import { cn } from "@/lib/utils";

export default async function TradingPartnersPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, partners, t, tSections] = await Promise.all([
    getSolutionPage("trading-partners", locale),
    getActivePartners(locale),
    getTranslations("Solutions"),
    getTranslations("SectionTitles"),
  ]);

  if (page.status === "hidden") notFound();

  const eyebrow = page.hero.eyebrow || t("partners.eyebrow");
  const title = page.hero.title || t("partners.defaultTitle");
  const subtitle = page.hero.subtitle || t("partners.defaultSubtitle");

  if (page.status === "comingSoon") {
    return (
      <>
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={tSections("partnersTitle") === title ? undefined : subtitle}
        />
        <ComingSoonPage
          eyebrow={eyebrow}
          title={page.body.heading || undefined}
          message={page.comingSoonMessage || undefined}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={subtitle} />

      {(page.body.heading || page.body.content) && (
        <ScrollReveal className="mb-10 max-w-3xl space-y-3">
          {page.body.heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
              {page.body.heading}
            </h2>
          )}
          {page.body.content && (
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {page.body.content}
            </p>
          )}
        </ScrollReveal>
      )}

      {partners.length === 0 ? (
        <p className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          {t("partners.empty")}
        </p>
      ) : (
        <ScrollReveal>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {partners.map((p) => (
              <li key={p.id}>
                <PartnerTile
                  name={p.name}
                  logoUrl={p.logoUrl}
                  summary={p.summary}
                  websiteUrl={p.websiteUrl}
                  invertOnDark={p.invertOnDark}
                />
              </li>
            ))}
          </ul>
        </ScrollReveal>
      )}
    </>
  );
}

interface TileProps {
  name: string;
  logoUrl: string;
  summary: string;
  websiteUrl: string;
  invertOnDark: boolean;
}

function PartnerTile({ name, logoUrl, summary, websiteUrl, invertOnDark }: TileProps) {
  const inner = (
    <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <Image
        src={logoUrl}
        alt={name}
        width={300}
        height={300}
        className={cn(
          "max-h-3/5 w-auto max-w-3/4 object-contain transition-opacity duration-200 group-hover:opacity-0",
          invertOnDark && "dark:invert",
        )}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-brand-deep/95 px-4 text-center text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-card">
        <p className="text-sm font-semibold">{name}</p>
        {summary && (
          <p className="line-clamp-4 text-xs leading-relaxed text-white/80 dark:text-muted-foreground">
            {summary}
          </p>
        )}
      </div>
    </div>
  );
  if (websiteUrl) {
    return (
      <Link href={websiteUrl} target="_blank" rel="noreferrer noopener" aria-label={name}>
        {inner}
      </Link>
    );
  }
  return inner;
}
