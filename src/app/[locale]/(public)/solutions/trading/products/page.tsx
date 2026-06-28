import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { HighlightText } from "@/components/public/highlight-text";
import { ListToolbar } from "@/components/public/list-toolbar";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PaginationNav } from "@/components/ui/pagination-nav";
import type { Locale } from "@/lib/cms/localize";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";
import { getPublishedProducts, getSolutionPage, type ProductData } from "@/lib/cms/solutions";
import { buildWaLink, fillTemplate } from "@/lib/whatsapp";

const PAGE_SIZE = 6;

function getProductName(p: ProductData): string {
  return (
    p.principles
      .map((pr) => pr.name)
      .filter(Boolean)
      .join(" · ") ||
    p.productType ||
    ""
  );
}

interface SearchParams {
  q?: string;
  sort?: string;
  filter?: string;
  page?: string;
}

export default async function TradingProductsPublicPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const locale = (await getLocale()) as Locale;
  const [page, products, t, sp] = await Promise.all([
    getSolutionPage("trading-products", locale),
    getPublishedProducts(locale),
    getTranslations("Solutions"),
    searchParams,
  ]);

  if (page.status === "hidden") notFound();

  const hero = resolveHero({
    mode: page.heroMode,
    hero: page.hero,
    defaults: {
      eyebrow: t("products.eyebrow"),
      title: t("products.defaultTitle"),
      subtitle: t("products.defaultSubtitle"),
    },
  });
  const body = resolveBody({
    mode: page.bodyMode,
    body: page.body,
    defaults: { heading: "", content: "" },
  });

  if (page.status === "comingSoon") {
    return (
      <>
        {hero && (
          <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />
        )}
        <ComingSoonPage
          eyebrow={hero?.eyebrow}
          title={body?.heading || undefined}
          message={page.comingSoonMessage || undefined}
        />
      </>
    );
  }

  // Distinct origins (built from the full catalogue) drive the filter dropdown.
  const origins = [...new Set(products.map((p) => p.origin).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, locale),
  );
  const q = (sp.q ?? "").trim().toLowerCase();
  const sort = sp.sort ?? "default";
  const activeOrigin = sp.filter && origins.includes(sp.filter) ? sp.filter : "all";

  let visible = products.filter((p) => {
    if (activeOrigin !== "all" && p.origin !== activeOrigin) return false;
    if (!q) return true;
    const haystack = [getProductName(p), p.origin, p.productType, ...p.items.map((it) => it.name)]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  if (sort === "nameAsc" || sort === "nameDesc") {
    const dir = sort === "nameAsc" ? 1 : -1;
    visible = [...visible].sort(
      (a, b) => dir * getProductName(a).localeCompare(getProductName(b), locale),
    );
  } else if (sort === "skuDesc") {
    visible = [...visible].sort((a, b) => b.skuCount - a.skuCount);
  }

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), totalPages);
  const paged = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const baseUrl = `/${locale}/solutions/trading/products`;
  const extraParams: Record<string, string> = {};
  if (sp.q?.trim()) extraParams.q = sp.q.trim();
  if (sort !== "default") extraParams.sort = sort;
  if (activeOrigin !== "all") extraParams.filter = activeOrigin;

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
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {body.content}
            </p>
          )}
        </ScrollReveal>
      )}

      {products.length === 0 ? (
        <p className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          {t("products.empty")}
        </p>
      ) : (
        <>
          <ListToolbar
            searchPlaceholder={t("products.searchPlaceholder")}
            searchAriaLabel={t("products.searchPlaceholder")}
            sortLabel={t("products.sortLabel")}
            sortOptions={[
              { value: "default", label: t("products.sortDefault") },
              { value: "nameAsc", label: t("products.sortNameAsc") },
              { value: "nameDesc", label: t("products.sortNameDesc") },
              { value: "skuDesc", label: t("products.sortSkuDesc") },
            ]}
            filterLabel={t("products.filterOrigin")}
            filterOptions={[
              { value: "all", label: t("products.allOrigins") },
              ...origins.map((o) => ({ value: o, label: o })),
            ]}
          />

          {paged.length === 0 ? (
            <p className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              {t("products.noResults")}
            </p>
          ) : (
            <div className="space-y-4">
              {paged.map((p, idx) => {
                const fallbackName = p.principles[0]?.name ?? "—";
                const productName =
                  p.principles
                    .map((pr) => pr.name)
                    .filter(Boolean)
                    .join(" · ") ||
                  p.productType ||
                  fallbackName;
                const waTemplate =
                  p.whatsappTemplate ||
                  page.whatsapp.template ||
                  t("products.whatsappDefaultTemplate");
                const waLink = buildWaLink(
                  page.whatsapp.number,
                  fillTemplate(waTemplate, productName),
                );
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
                            <HighlightText
                              text={
                                p.principles
                                  .map((pr) => pr.name)
                                  .filter(Boolean)
                                  .join(" · ") || fallbackName
                              }
                              query={q}
                            />
                          </h3>
                          {p.origin && (
                            <Badge variant="outline" className="text-[10px] uppercase">
                              {t("products.originLabel")} ·{" "}
                              <HighlightText text={p.origin} query={q} />
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
                            <HighlightText text={p.productType} query={q} />
                          </p>
                        )}
                        {p.items.length > 0 && (
                          <ul className="space-y-3 pt-1">
                            {p.items.map((it, i) => (
                              // biome-ignore lint/suspicious/noArrayIndexKey: items order is stable per product
                              <li key={i} className="space-y-2">
                                {it.name && (
                                  <p className="text-sm font-semibold text-brand-deep dark:text-foreground">
                                    <HighlightText text={it.name} query={q} />
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
                        <div className="pt-1">
                          {waLink ? (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer noopener"
                              className={buttonVariants({ variant: "brand", size: "sm" })}
                            >
                              <MessageCircle aria-hidden="true" />
                              {t("products.whatsappCta")}
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className={buttonVariants({ variant: "brand", size: "sm" })}
                            >
                              <MessageCircle aria-hidden="true" />
                              {t("products.whatsappCta")}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          )}

          <PaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={baseUrl}
            extraParams={Object.keys(extraParams).length > 0 ? extraParams : undefined}
          />
        </>
      )}
    </>
  );
}
