import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import { UnderConstructionIllustration } from "./under-construction-illustration";

interface Props {
  /** Eyebrow shown above title (CMS or i18n fallback). */
  eyebrow?: string;
  /** Page title (CMS or i18n fallback). */
  title?: string;
  /** Body message from CMS — overrides default subtitle when non-empty. */
  message?: string;
}

/**
 * Rendered for any solutions page whose status is `comingSoon`. Visually
 * mirrors <UnderConstruction /> but accepts page-specific copy from CMS so
 * each surface can communicate a tailored "coming soon" message.
 */
export async function ComingSoonPage({ eyebrow, title, message }: Props) {
  const t = await getTranslations("Solutions.comingSoon");
  const locale = await getLocale();

  return (
    <ScrollReveal className="flex flex-col items-center gap-6 py-10 text-center md:gap-8 md:py-16">
      <UnderConstructionIllustration />
      {eyebrow && (
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
          {eyebrow}
        </p>
      )}
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
          {title?.trim() || t("title")}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {message?.trim() || t("subtitle")}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/${locale}/contact`}
          className={buttonVariants({ variant: "brand", size: "lg" })}
        >
          {t("contactCta")}
        </Link>
        <Link
          href={`/${locale}`}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          {t("homeCta")}
        </Link>
      </div>
    </ScrollReveal>
  );
}
