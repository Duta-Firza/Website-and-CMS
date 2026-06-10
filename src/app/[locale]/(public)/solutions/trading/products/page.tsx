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
          {products.map((p, idx) => {
            const fallbackName = p.principles[0]?.name ?? "—";
            return (
              <ScrollReveal key={p.id} delay={idx * 60}>
                <article className="grid grid-cols-1 gap-5 rounded-2xl border bg-card p-5 md:grid-cols-[180px_1fr] md:gap-6 md:p-6">
                  <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-muted/40 p-4">
                    {p.principles.length === 0 ? (
                      <span className="text-2xl font-semibold text-brand-deep dark:text-foreground">
                        —
                      </span>
                    ) : (
                      p.principles.map((pr, i) =>
                        pr.logoUrl ? (
                          <Image
                            // biome-ignore lint/suspicious/noArrayIndexKey: principles order is stable per product
                            key={i}
                            src={pr.logoUrl}
                            alt={pr.name || "Principle logo"}
                            width={240}
                            height={120}
                            className="max-h-16 w-auto max-w-full object-contain"
                          />
                        ) : (
                          <span
                            // biome-ignore lint/suspicious/noArrayIndexKey: principles order is stable per product
                            key={i}
                            className="text-sm font-semibold text-brand-deep dark:text-foreground"
                          >
                            {pr.name || "—"}
                          </span>
                        ),
                      )
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="text-xl font-semibold text-brand-deep dark:text-foreground">
                        {p.principles
                          .map((pr) => pr.name)
                          .filter(Boolean)
                          .join(" · ") || fallbackName}
                      </h3>
                      {p.origin && (
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {t("products.originLabel")} · {p.origin}
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
                    {p.items.length > 0 && (
                      <ul className="space-y-3 pt-1">
                        {p.items.map((it, i) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: items order is stable per product
                          <li key={i} className="space-y-2">
                            {it.name && (
                              <p className="text-sm font-semibold text-brand-deep dark:text-foreground">
                                {it.name}
                              </p>
                            )}
                            {it.photos.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {it.photos.map((photo, j) => (
                                  <div
                                    // biome-ignore lint/suspicious/noArrayIndexKey: photo order is stable per item
                                    key={j}
                                    className="relative h-16 w-24 overflow-hidden rounded-md border bg-muted"
                                  >
                                    <Image
                                      src={photo}
                                      alt={`${it.name || fallbackName} ${j + 1}`}
                                      fill
                                      sizes="96px"
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </>
  );
}
