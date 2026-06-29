import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { IrThumbnail } from "@/components/public/ir/ir-thumbnail";
import { ListToolbar } from "@/components/public/list-toolbar";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { getIrSubPage, getPublications } from "@/lib/cms/investor-relations";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";

function toLocale(l: string): "id" | "en" {
  return l === "en" ? "en" : "id";
}

const PAGE_SIZE = 9;

interface PageParams {
  locale: string;
}
interface SearchParams {
  q?: string;
  sort?: string;
  filter?: string;
  page?: string;
}

export default async function PressReleasePage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
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

  const baseUrl = `/${locale}/investor-relations/publications/press-release`;
  const dateFmt = (d: Date) =>
    new Date(d).toLocaleDateString(safeLocale === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const years = [...new Set(releases.map((r) => new Date(r.publishedAt).getFullYear()))].sort(
    (a, b) => b - a,
  );
  const q = (sp.q ?? "").trim().toLowerCase();
  const sort = sp.sort ?? "newest";
  const activeYear =
    sp.filter && years.includes(Number(sp.filter)) ? String(Number(sp.filter)) : "all";

  let visible = releases.filter((r) => {
    if (activeYear !== "all" && String(new Date(r.publishedAt).getFullYear()) !== activeYear)
      return false;
    if (!q) return true;
    return `${r.title} ${r.summary}`.toLowerCase().includes(q);
  });
  if (sort === "oldest") {
    visible = [...visible].sort(
      (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
    );
  } else if (sort === "title") {
    visible = [...visible].sort((a, b) => a.title.localeCompare(b.title, safeLocale));
  } else {
    visible = [...visible].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), totalPages);
  const paged = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const extraParams: Record<string, string> = {};
  if (q) extraParams.q = q;
  if (sort !== "newest") extraParams.sort = sort;
  if (activeYear !== "all") extraParams.filter = activeYear;

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

      {releases.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {tIR("pressReleasesEmpty")}
        </p>
      ) : (
        <>
          <ListToolbar
            searchPlaceholder={tIR("searchReleases")}
            searchAriaLabel={tIR("searchReleases")}
            sortLabel={tIR("sortLabel")}
            sortOptions={[
              { value: "newest", label: tIR("sortNewest") },
              { value: "oldest", label: tIR("sortOldest") },
              { value: "title", label: tIR("sortTitle") },
            ]}
            filterLabel={tIR("filterYear")}
            filterOptions={[
              { value: "all", label: tIR("allYears") },
              ...years.map((y) => ({ value: String(y), label: String(y) })),
            ]}
          />

          {paged.length === 0 ? (
            <p className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              {tIR("noResults")}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((rel, idx) => (
                <ScrollReveal key={rel.id} delay={Math.min(idx, 5) * 60}>
                  <Link
                    href={`${baseUrl}/${rel.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                  >
                    <IrThumbnail src={rel.imageUrl || undefined} alt={rel.title} />
                    <div className="flex flex-1 flex-col p-5">
                      <p className="mb-2 text-xs text-muted-foreground">
                        {dateFmt(rel.publishedAt)}
                      </p>
                      <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-brand-deep transition-colors group-hover:text-brand-accent dark:text-foreground">
                        {rel.title}
                      </h3>
                      {rel.summary && (
                        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                          {rel.summary}
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
