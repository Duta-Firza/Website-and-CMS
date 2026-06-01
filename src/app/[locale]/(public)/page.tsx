import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t("heroTitle")}</h1>
        <p className="text-lg text-muted-foreground">{t("heroSubtitle")}</p>
      </div>
    </section>
  );
}
