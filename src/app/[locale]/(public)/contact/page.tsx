import { Clock, Download, ExternalLink, Mail, MapPin, Navigation, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/public/coming-soon-page";
import { InquiryForm } from "@/components/public/inquiry-form";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { PageHeader } from "@/components/public/section/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getContactPage } from "@/lib/cms/contact";
import { getCompanyProfileUrl } from "@/lib/cms/investor-relations";
import type { Locale } from "@/lib/cms/localize";
import { resolveBody, resolveHero } from "@/lib/cms/section-mode";
import { getSiteSettings } from "@/lib/cms/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SectionTitles");
  return { title: t("contactTitle") };
}

export default async function ContactPublicPage() {
  const locale = (await getLocale()) as Locale;
  const [page, settings, companyProfileUrl, tTitles, t] = await Promise.all([
    getContactPage(locale),
    getSiteSettings(locale),
    getCompanyProfileUrl(),
    getTranslations("SectionTitles"),
    getTranslations("Contact"),
  ]);

  if (page.status === "hidden") notFound();

  const hero = resolveHero({
    mode: page.heroMode,
    hero: page.hero,
    defaults: {
      eyebrow: tTitles("contactEyebrow"),
      title: tTitles("contactTitle"),
      subtitle: "",
    },
  });
  const body = resolveBody({
    mode: page.bodyMode,
    body: page.body,
    defaults: { heading: "", content: "" },
  });

  if (page.status === "comingSoon") {
    return (
      <>
        {hero && (
          <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />
        )}
        <ComingSoonPage eyebrow={hero?.eyebrow} title={hero?.title} />
      </>
    );
  }

  const showFactory = page.showFactory && Boolean(settings.addressFactory);
  const socials = [
    { url: settings.social.linkedin, label: "LinkedIn" },
    { url: settings.social.instagram, label: "Instagram" },
    { url: settings.social.youtube, label: "YouTube" },
  ].filter((s) => Boolean(s.url));

  return (
    <>
      {hero && <PageHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.subtitle} />}

      {body && (body.heading || body.content) && (
        <ScrollReveal className="mb-12 max-w-3xl space-y-3">
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

      {/* Location cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <LocationCard
          name={t("headOffice")}
          address={settings.addressHO}
          officeHours={page.showOfficeHours ? settings.officeHours : ""}
          directionsUrl={page.showGetDirections ? page.office.directionsUrl : ""}
          directionsLabel={t("getDirections")}
          hoursLabel={t("officeHours")}
          delay={0}
        />
        {showFactory && (
          <LocationCard
            name={t("factory")}
            address={settings.addressFactory}
            officeHours={page.showOfficeHours ? settings.officeHours : ""}
            directionsUrl={page.showGetDirections ? page.factory.directionsUrl : ""}
            directionsLabel={t("getDirections")}
            hoursLabel={t("officeHours")}
            delay={80}
          />
        )}
      </div>

      {/* Contact methods */}
      <ScrollReveal className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settings.phoneNumber && (
          <ContactRow
            Icon={Phone}
            label={t("phone")}
            value={settings.phoneNumber}
            href={`tel:${settings.phoneNumber}`}
          />
        )}
        <ContactRow
          Icon={Mail}
          label={page.showDepartmentContacts ? t("generalInquiries") : t("email")}
          value={settings.contactEmail}
          href={`mailto:${settings.contactEmail}`}
        />
        {page.showDepartmentContacts && settings.salesEmail && (
          <ContactRow
            Icon={Mail}
            label={t("salesInquiries")}
            value={settings.salesEmail}
            href={`mailto:${settings.salesEmail}`}
          />
        )}
      </ScrollReveal>

      {/* Map embeds */}
      {page.showMap && page.office.mapEmbedUrl && (
        <ScrollReveal className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
            {t("findUs")}
          </h2>
          <div
            className={
              showFactory && page.factory.mapEmbedUrl ? "grid grid-cols-1 gap-4 md:grid-cols-2" : ""
            }
          >
            <MapFrame src={page.office.mapEmbedUrl} title={t("headOffice")} />
            {showFactory && page.factory.mapEmbedUrl && (
              <MapFrame src={page.factory.mapEmbedUrl} title={t("factory")} />
            )}
          </div>
        </ScrollReveal>
      )}

      {/* Social + company profile */}
      {((page.showSocial && socials.length > 0) ||
        (page.showCompanyProfile && companyProfileUrl)) && (
        <ScrollReveal className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6">
          {page.showSocial && socials.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-accent">
                {t("followUs")}
              </p>
              <div className="flex flex-wrap gap-2">
                {socials.map(({ url, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm text-muted-foreground transition hover:border-brand-accent/40 hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          )}
          {page.showCompanyProfile && companyProfileUrl && (
            <a
              href={companyProfileUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonVariants({ variant: "outline" })}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("downloadProfile")}
            </a>
          )}
        </ScrollReveal>
      )}

      {/* Contact form */}
      {page.form.enabled && (
        <ScrollReveal>
          <div className="mt-12 rounded-2xl border bg-card p-6 md:p-10">
            <div className="mb-6 max-w-2xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
                {t("formTitle")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{t("formSubtitle")}</p>
            </div>
            <InquiryForm
              source="contact"
              fields={page.form.fields}
              submitLabel={page.form.submitLabel}
              successMessage={page.form.successMessage}
            />
          </div>
        </ScrollReveal>
      )}
    </>
  );
}

function LocationCard({
  name,
  address,
  officeHours,
  directionsUrl,
  directionsLabel,
  hoursLabel,
  delay,
}: {
  name: string;
  address: string;
  officeHours: string;
  directionsUrl: string;
  directionsLabel: string;
  hoursLabel: string;
  delay: number;
}) {
  return (
    <ScrollReveal delay={delay} className="flex flex-col rounded-xl border bg-card p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent">
          <MapPin className="h-4.5 w-4.5" />
        </span>
        <div className="space-y-1">
          <h3 className="font-semibold text-brand-deep dark:text-foreground">{name}</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {address}
          </p>
        </div>
      </div>
      {officeHours && (
        <div className="mt-4 flex items-start gap-3 border-t pt-4">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium text-foreground">{hoursLabel}</p>
            <p className="text-sm text-muted-foreground">{officeHours}</p>
          </div>
        </div>
      )}
      {directionsUrl && (
        <Link
          href={directionsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-flex items-center text-sm font-medium text-brand-accent hover:underline"
        >
          <Navigation className="mr-1.5 h-3.5 w-3.5" />
          {directionsLabel}
          <ExternalLink className="ml-1 h-3 w-3" />
        </Link>
      )}
    </ScrollReveal>
  );
}

function ContactRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: typeof Mail;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 transition hover:border-brand-accent/40"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="block truncate text-sm font-medium text-foreground">{value}</span>
      </span>
    </a>
  );
}

function MapFrame({ src, title }: { src: string; title: string }) {
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="aspect-video w-full rounded-xl border"
      allowFullScreen
    />
  );
}
