import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import { UnderConstructionIllustration } from "./under-construction-illustration";

/**
 * Drop-in body for any public section page whose content isn't ready yet.
 * Sits below the page's `<PageHeader />` and presents the blueprint
 * illustration + a brief message + two CTAs (Contact / Home).
 */
export async function UnderConstruction() {
  const t = await getTranslations("UnderConstruction");
  const locale = await getLocale();

  return (
    <ScrollReveal className="flex flex-col items-center gap-6 py-10 text-center md:gap-8 md:py-16">
      <UnderConstructionIllustration />
      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
        {t("eyebrow")}
      </p>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
          {t("title")}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("description")}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* <Link href={`/${locale}/contact`} className={buttonVariants({ size: "lg" })}>
          {t("contactCta")}
        </Link> */}
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
