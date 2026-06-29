import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { buttonVariants } from "@/components/ui/button";
import { connectDB } from "@/lib/db";
import { SITE_SETTINGS_ID, SiteSettings } from "@/models";

interface ContactInfo {
  contactEmail: string;
}

async function loadContactInfo(): Promise<ContactInfo> {
  await connectDB();
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID).select("contactEmail").lean<{
    contactEmail?: string;
  } | null>();
  return { contactEmail: doc?.contactEmail ?? "info@dutafirza.com" };
}

export default async function InvestorRelationsPage() {
  const [t, tIR, locale, contact] = await Promise.all([
    getTranslations("SectionTitles"),
    getTranslations("IR"),
    getLocale(),
    loadContactInfo(),
  ]);

  const overviews = [
    {
      key: "reports",
      title: t("reportsTitle"),
      description: "Annual and financial reports.",
      href: `/${locale}/investor-relations/reports`,
    },
    {
      key: "publications",
      title: t("publicationsTitle"),
      description: "Newsroom and press releases.",
      href: `/${locale}/investor-relations/publications`,
    },
    {
      key: "companyProfile",
      title: t("companyProfileTitle"),
      description: "Download our company profile PDF.",
      href: `/${locale}/investor-relations/publications/company-profile`,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("investorRelationsEyebrow")}
        title={t("investorRelationsTitle")}
      />

      <ScrollReveal className="mb-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {overviews.map((item, idx) => (
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

      <ScrollReveal className="mb-12">
        <div className="rounded-xl border bg-muted/30 p-6">
          <span className="mb-4 block h-0.75 w-8 bg-brand-accent" aria-hidden />
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-brand-deep dark:text-foreground">
            {tIR("contactHeading")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {tIR("irContact")}:{" "}
            <a
              href={`mailto:${contact.contactEmail}`}
              className="text-primary hover:underline"
            >
              {contact.contactEmail}
            </a>
          </p>
        </div>
      </ScrollReveal>
    </>
  );
}
