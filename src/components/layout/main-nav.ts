/**
 * Single source of truth for the public site navigation structure.
 * Used by: desktop mega menu, mobile drawer, and section sidebars.
 * Labels resolve at render time from the next-intl `Nav` namespace.
 *
 * Three tiers — matching the brief sitemap:
 *   - NavTop:    purple, clickable + hover trigger (e.g. "About Us")
 *   - NavSub:    blue, appears in dropdown + sidebar (e.g. "Leadership")
 *   - NavSubSub: orange, nested route + nested sidebar subtab (e.g. "Partners")
 *
 * In-page tabs (green in the sitemap, e.g. Certifications/Acknowledgements,
 * Annual/Financial, Project 1/Project 2) are NOT modelled here — they live as
 * URL search params on the parent route and are rendered via <PageTabs>.
 */

export interface NavSubSub {
  labelKey: string;
  href: string;
}

export interface NavSub {
  labelKey: string;
  href: string;
  children?: NavSubSub[];
}

export interface NavTop {
  labelKey: string;
  href: string;
  children?: NavSub[];
}

export function buildNav(locale: string): NavTop[] {
  const base = `/${locale}`;
  return [
    {
      labelKey: "home",
      href: base,
    },
    {
      labelKey: "about",
      href: `${base}/about`,
      children: [
        { labelKey: "aboutWhoWeAre", href: `${base}/about` },
        { labelKey: "leadership", href: `${base}/about/leadership` },
        { labelKey: "history", href: `${base}/about/history` },
        { labelKey: "business", href: `${base}/about/business` },
        { labelKey: "credentials", href: `${base}/about/credentials` },
      ],
    },
    {
      labelKey: "solutions",
      href: `${base}/solutions`,
      children: [
        {
          labelKey: "trading",
          href: `${base}/solutions/trading`,
          children: [
            { labelKey: "partners", href: `${base}/solutions/trading/partners` },
            { labelKey: "products", href: `${base}/solutions/trading/products` },
          ],
        },
        { labelKey: "manufacturing", href: `${base}/solutions/manufacturing` },
        { labelKey: "epc", href: `${base}/solutions/epc` },
      ],
    },
    {
      labelKey: "investorRelations",
      href: `${base}/investor-relations`,
      children: [
        { labelKey: "stocks", href: `${base}/investor-relations/stocks` },
        { labelKey: "reports", href: `${base}/investor-relations/reports` },
        {
          labelKey: "publications",
          href: `${base}/investor-relations/publications`,
          children: [
            {
              labelKey: "pressRelease",
              href: `${base}/investor-relations/publications/press-release`,
            },
            { labelKey: "newsroom", href: `${base}/investor-relations/publications/newsroom` },
            {
              labelKey: "companyProfile",
              href: `${base}/investor-relations/publications/company-profile`,
            },
          ],
        },
      ],
    },
    {
      labelKey: "contact",
      href: `${base}/contact`,
      children: [{ labelKey: "careers", href: `${base}/contact/careers` }],
    },
  ];
}
