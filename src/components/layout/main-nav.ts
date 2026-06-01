/**
 * Single source of truth for the public site navigation structure.
 * Used by both desktop NavigationMenu and mobile Sheet drawer.
 * Labels resolve at render time from the next-intl `Nav` namespace.
 */
export interface NavChild {
  labelKey: string;
  href: string;
}

export interface NavItem {
  labelKey: string;
  href: string;
  children?: NavChild[];
}

export function buildNav(locale: string): NavItem[] {
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
        { labelKey: "leadership", href: `${base}/leadership` },
        { labelKey: "history", href: `${base}/history` },
        { labelKey: "business", href: `${base}/business` },
        { labelKey: "credentials", href: `${base}/credentials` },
      ],
    },
    {
      labelKey: "solutions",
      href: `${base}/solutions/trading`,
      children: [
        { labelKey: "trading", href: `${base}/solutions/trading` },
        { labelKey: "manufacturing", href: `${base}/solutions/manufacturing` },
        { labelKey: "epc", href: `${base}/solutions/epc` },
      ],
    },
    {
      labelKey: "partners",
      href: `${base}/partners`,
    },
    {
      labelKey: "newsroom",
      href: `${base}/newsroom`,
    },
    {
      labelKey: "contact",
      href: `${base}/contact`,
    },
  ];
}
