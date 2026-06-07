import { getTranslations } from "next-intl/server";
import { NotFoundContent } from "@/components/public/not-found-content";
import { routing } from "@/i18n/routing";

/**
 * Root-level not-found. Used when Next.js can't render the per-locale
 * `[locale]/not-found.tsx` — typically because `[locale]/layout.tsx` itself
 * called `notFound()` (invalid locale segment). Falls back to the default
 * locale's copy so we still ship the styled page instead of the framework
 * default.
 *
 * The `(public)/layout.tsx` Header + Footer chrome is intentionally NOT
 * applied here — this file is mounted by the root `app/layout.tsx` (which
 * owns html/body/ThemeProvider) only, so the 404 renders as a clean
 * standalone page even when locale routing has fully failed.
 */
export default async function NotFound() {
  const locale = routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "NotFound" });

  return (
    <NotFoundContent
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      homeCta={t("homeCta")}
      contactCta={t("contactCta")}
      locale={locale}
    />
  );
}
