import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import { getPublication } from "@/lib/cms/investor-relations";

function toLocale(l: string): "id" | "en" {
  return l === "en" ? "en" : "id";
}

interface PageParams {
  locale: string;
  slug: string;
}

export default async function PressReleaseArticlePage({ params }: { params: Promise<PageParams> }) {
  const { locale, slug } = await params;
  const safeLocale = toLocale(locale);
  const [tIR, article] = await Promise.all([
    getTranslations("IR"),
    getPublication(slug, safeLocale),
  ]);

  if (article?.category !== "press-release") notFound();

  return (
    <article className="w-full">
      <ScrollReveal className="mb-8">
        <Link
          href={`/${locale}/investor-relations/publications/press-release`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← {tIR("backToPressRelease")}
        </Link>
      </ScrollReveal>

      {article.imageUrl && (
        <ScrollReveal className="mb-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 768px) 80vw, 100vw"
            />
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {tIR("publishedDate")} ·{" "}
          {new Date(article.publishedAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-2xl font-semibold leading-snug tracking-tight text-brand-deep dark:text-foreground md:text-3xl">
          {article.title}
        </h1>
        {article.summary && (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{article.summary}</p>
        )}
      </ScrollReveal>

      {article.body && (
        <ScrollReveal>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: CMS rich-text body is admin-authored
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </ScrollReveal>
      )}

      {article.originalUrl && (
        <ScrollReveal className="mt-10">
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            {locale === "id" ? "Sumber asli" : "Original source"}
          </a>
        </ScrollReveal>
      )}
    </article>
  );
}
