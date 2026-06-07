import { ExternalLink, Mail, MapPin, Phone, Play } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import type { Locale } from "@/lib/cms/localize";
import { getSiteSettings } from "@/lib/cms/site-settings";
import { getSolutionPageVisibilityMap } from "@/lib/cms/solutions";
import { Logo } from "./logo";
import { applyVisibilityToNav, buildNav } from "./main-nav";

export async function Footer() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Footer");
  const tCommon = await getTranslations("Common");
  const tNav = await getTranslations("Nav");
  const [settings, visibility] = await Promise.all([
    getSiteSettings(locale),
    getSolutionPageVisibilityMap(),
  ]);
  const nav = applyVisibilityToNav(buildNav(locale), visibility);

  const solutionsItem = nav.find((n) => n.labelKey === "solutions");
  const aboutItem = nav.find((n) => n.labelKey === "about");

  return (
    <footer className="border-t bg-brand-deep text-white">
      <div className="container mx-auto grid grid-cols-1 gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <ScrollReveal className="space-y-3">
          <Link
            href={`/${locale}`}
            aria-label={tCommon("companyName")}
            className="inline-flex items-center"
          >
            <Logo variant="on-dark" className="h-10" />
          </Link>
          <p className="text-sm leading-relaxed text-white/70">{tCommon("tagline")}</p>
          {(settings.social.linkedin || settings.social.youtube || settings.social.instagram) && (
            <div className="flex gap-2 pt-2">
              {settings.social.linkedin && (
                <a
                  href={settings.social.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="LinkedIn"
                  className="rounded-md p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {settings.social.youtube && (
                <a
                  href={settings.social.youtube}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="YouTube"
                  className="rounded-md p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <Play className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </ScrollReveal>

        {/* Solutions column */}
        <ScrollReveal delay={80} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {t("solutionsTitle")}
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            {solutionsItem?.children?.map((c) => (
              <li key={c.labelKey}>
                <Link href={c.href} className="hover:text-white">
                  {tNav(c.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </ScrollReveal>

        {/* Company column */}
        <ScrollReveal delay={160} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {t("companyTitle")}
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            {aboutItem?.children?.map((c) => (
              <li key={c.labelKey}>
                <Link href={c.href} className="hover:text-white">
                  {tNav(c.labelKey)}
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/${locale}/newsroom`} className="hover:text-white">
                {tNav("newsroom")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/careers`} className="hover:text-white">
                {tNav("careers")}
              </Link>
            </li>
          </ul>
        </ScrollReveal>

        {/* Contact column */}
        <ScrollReveal delay={240} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {t("contactTitle")}
          </h3>
          <ul className="space-y-3 text-sm text-white/70">
            {settings.addressHO && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <span>
                  <span className="block font-medium text-white">{t("headOffice")}</span>
                  {settings.addressHO}
                </span>
              </li>
            )}
            {settings.phoneNumber && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <a href={`tel:${settings.phoneNumber}`} className="hover:text-white">
                  {settings.phoneNumber}
                </a>
              </li>
            )}
            {settings.contactEmail && (
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                  {settings.contactEmail}
                </a>
              </li>
            )}
          </ul>
        </ScrollReveal>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/50 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {tCommon("companyName")}. {t("rights")}
          </p>
          <div className="flex gap-4">
            <Link href={`/${locale}/privacy`} className="hover:text-white">
              {t("privacy")}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-white">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
