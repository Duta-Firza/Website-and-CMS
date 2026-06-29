import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";

interface PageParams { locale: string }

export default async function PublicationsPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const t = await getTranslations("SectionTitles");

  const items = [
    {
      key: "newsroom",
      title: t("newsroomTitle"),
      description: "Latest news and company updates.",
      href: `/${locale}/investor-relations/publications/newsroom`,
    },
    {
      key: "press-release",
      title: t("pressReleaseTitle"),
      description: "Official press releases and announcements.",
      href: `/${locale}/investor-relations/publications/press-release`,
    },
    {
      key: "company-profile",
      title: t("companyProfileTitle"),
      description: "Download our company profile document.",
      href: `/${locale}/investor-relations/publications/company-profile`,
    },
  ];

  return (
    <>
      <PageHeader eyebrow={t("investorRelationsEyebrow")} title={t("publicationsTitle")} />
      <ScrollReveal className="mb-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((item, idx) => (
            <ScrollReveal key={item.key} delay={idx * 80}>
              <Link
                href={item.href}
                className="group block rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <span className="mb-4 block h-0.75 w-8 bg-brand-accent" aria-hidden />
                <h2 className="mb-2 text-lg font-semibold tracking-tight text-brand-deep transition-colors group-hover:text-brand-accent dark:text-foreground">
                  {item.title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </>
  );
}
