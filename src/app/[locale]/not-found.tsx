import { getLocale, getTranslations } from "next-intl/server";
import { NotFoundContent } from "@/components/public/not-found-content";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const locale = await getLocale();

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
