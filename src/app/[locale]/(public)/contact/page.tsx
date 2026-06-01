import { useTranslations } from "next-intl";

export default function Page() {
  const nav = useTranslations("Nav");
  const common = useTranslations("Common");

  return (
    <section className="container mx-auto px-4 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">{nav("contact")}</h1>
      <p className="mt-3 text-muted-foreground">{common("comingSoon")}</p>
    </section>
  );
}
