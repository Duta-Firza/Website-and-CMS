import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { PageHeader } from "@/components/public/section/page-header";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { getIrSubPage, getPublications } from "@/lib/cms/investor-relations";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";

function toLocale(l: string): "id" | "en" {
  return l === "en" ? "en" : "id";
}

const PAGE_SIZE = 9;

interface PageParams { locale: string }
interface SearchParams { page?: string }

export default async function NewsroomPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const safeLocale = toLocale(locale);
  const currentPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [tSec, tIR, meta, { items: articles, totalPages }] = await Promise.all([
    getTranslations("SectionTitles"),
    getTranslations("IR"),
    getIrSubPage("newsroom", safeLocale),
    getPublications(safeLocale, "newsroom", true, { page: currentPage, limit: PAGE_SIZE }),
  ]);

  if (meta.status === "hidden") notFound();

  const hero = resolveHero({
    mode: meta.heroMode,
    hero: meta.hero,
    defaults: {
      eyebrow: tSec("investorRelationsEyebrow"),
      title: tSec("newsroomTitle"),
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

  const baseUrl = `/${locale}/investor-relations/publications/newsroom`;

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
        {articles.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{tIR("newsroomEmpty")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, idx) => (
              <ScrollReveal key={article.id} delay={idx * 60}>
                <Link
                  href={`${baseUrl}/${article.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                >
                  {article.imageUrl ? (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted/40" />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="mb-2 text-xs text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleDateString(
                        locale === "id" ? "id-ID" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </p>
                    <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-brand-deep transition-colors group-hover:text-brand-accent dark:text-foreground">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                        {article.summary}
                      </p>
                    )}
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand-accent">
                      {tIR("readMore")} →
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
        <PaginationNav currentPage={currentPage} totalPages={totalPages} baseUrl={baseUrl} />
      </ScrollReveal>
    </>
  );
}
