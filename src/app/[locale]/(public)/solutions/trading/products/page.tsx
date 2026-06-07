import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/cms/localize";
import { getPublishedProducts, getSolutionPage } from "@/lib/cms/solutions";

export default async function TradingProductsPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, products, t] = await Promise.all([
    getSolutionPage("trading-products", locale),
    getPublishedProducts(locale),
    getTranslations("Solutions"),
  ]);

  if (page.status === "hidden") notFound();

  const eyebrow = page.hero.eyebrow || t("products.eyebrow");
  const title = page.hero.title || t("products.defaultTitle");
  const subtitle = page.hero.subtitle || t("products.defaultSubtitle");

  if (page.status === "comingSoon") {
    return (
      <>
        <PageHeader eyebrow={eyebrow} title={title} description={subtitle} />
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

      {products.length === 0 ? (
        <p className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          {t("products.empty")}
        </p>
      ) : (
        <div className="space-y-4">
          {products.map((p, idx) => (
            <ScrollReveal key={p.id} delay={idx * 60}>
              <article className="grid grid-cols-1 gap-5 rounded-2xl border bg-card p-5 md:grid-cols-[180px_1fr] md:gap-6 md:p-6">
                <div className="flex items-center justify-center rounded-lg bg-muted/40 p-4">
                  {p.principle.logoUrl ? (
                    <Image
                      src={p.principle.logoUrl}
                      alt={p.principle.name || "Product logo"}
                      width={300}
                      height={180}
                      className="max-h-24 w-auto max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-brand-deep dark:text-foreground">
                      {p.principle.name || "—"}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-xl font-semibold text-brand-deep dark:text-foreground">
                      {p.principle.name}
                    </h3>
                    {p.principle.origin && (
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {t("products.originLabel")} · {p.principle.origin}
                      </Badge>
                    )}
                    {p.skuCount > 0 && (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {t("products.skuLabel", { count: p.skuCount })}
                      </Badge>
                    )}
                    {p.partnershipStart && (
                      <span className="text-xs text-muted-foreground">
                        {t("products.partnershipLabel", { year: p.partnershipStart })}
                      </span>
                    )}
                  </div>
                  {p.productType && (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {p.productType}
                    </p>
                  )}
                  {p.photos.length > 0 && (
                    <ul className="flex flex-wrap gap-2 pt-1">
                      {p.photos.map((photo, i) => (
                        <li
                          // biome-ignore lint/suspicious/noArrayIndexKey: photos array is content-driven and stable per product
                          key={i}
                          className="relative h-16 w-24 overflow-hidden rounded-md border bg-muted"
                        >
                          <Image
                            src={photo}
                            alt={`${p.principle.name} ${i + 1}`}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      )}
    </>
  );
}
