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
  /** When true, the public site shows a "Coming soon" badge next to the label. */
  comingSoon?: boolean;
}

export interface NavSub {
  labelKey: string;
  href: string;
  children?: NavSubSub[];
  comingSoon?: boolean;
}

export interface NavTop {
  labelKey: string;
  href: string;
  children?: NavSub[];
  comingSoon?: boolean;
}

/** Visibility map keyed by SolutionPage slug (or any nav-entry key). */
export type NavVisibilityMap = Record<string, "published" | "comingSoon" | "hidden">;

/**
 * Map a navigation tree against a visibility map: removes `hidden` entries
 * (whole branches if a parent is hidden) and tags `comingSoon` entries with
 * the `comingSoon: true` flag so downstream UIs can show a badge.
 *
 * Lookups use a slug-derived key built from the href tail — e.g.
 *   `/id/solutions/trading/partners` → `trading-partners`
 *   `/id/solutions/trading`          → `trading`
 *   `/id/solutions`                  → `solutions`
 * which matches the SolutionPage `_id` values written by the CMS.
 */
export function applyVisibilityToNav(nav: NavTop[], visibility: NavVisibilityMap): NavTop[] {
  const slugFor = (href: string): string => {
    const m = href.match(/\/solutions(\/.*)?$/);
    if (!m) return "";
    const tail = m[1] ?? "";
    if (!tail) return "solutions";
    // strip leading slash and replace `/` with `-` so trading/partners → trading-partners
    return tail.slice(1).replace(/\//g, "-");
  };
  const filterTop = (top: NavTop): NavTop | null => {
    const filteredChildren: NavSub[] = [];
    for (const sub of top.children ?? []) {
      const subSlug = slugFor(sub.href);
      const subStatus = subSlug ? visibility[subSlug] : undefined;
      if (subStatus === "hidden") continue;
      const filteredSubSub: NavSubSub[] = [];
      for (const ss of sub.children ?? []) {
        const ssSlug = slugFor(ss.href);
        const ssStatus = ssSlug ? visibility[ssSlug] : undefined;
        if (ssStatus === "hidden") continue;
        filteredSubSub.push({ ...ss, comingSoon: ssStatus === "comingSoon" });
      }
      filteredChildren.push({
        ...sub,
        children: filteredSubSub.length > 0 ? filteredSubSub : undefined,
        comingSoon: subStatus === "comingSoon",
      });
    }
    // When a parent has children defined, its own visibility is irrelevant —
    // visibility is implied by what's still showing underneath. This matters
    // for /solutions, whose href now redirects to /solutions/trading: hiding
    // Trading should not also wipe out Manufacturing + EPC from the menu.
    // For leaf parents (no children), fall back to the parent's own status.
    const hasChildren = (top.children?.length ?? 0) > 0;
    if (hasChildren) {
      if (filteredChildren.length === 0) return null;
    } else {
      const topSlug = slugFor(top.href);
      const topStatus = topSlug ? visibility[topSlug] : undefined;
      if (topStatus === "hidden") return null;
    }
    const topSlug = slugFor(top.href);
    const topStatus = topSlug ? visibility[topSlug] : undefined;
    return {
      ...top,
      children: filteredChildren.length > 0 ? filteredChildren : undefined,
      comingSoon: !hasChildren && topStatus === "comingSoon",
    };
  };
  return nav.map(filterTop).filter((t): t is NavTop => t !== null);
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
      // No standalone /solutions landing — clicking the parent jumps straight
      // to the first sub-page. The 3 solution cards now live at the bottom of
      // each sub-page with the active one highlighted.
      href: `${base}/solutions/trading`,
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
        { labelKey: "technology", href: `${base}/solutions/technology` },
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
      labelKey: "connect",
      href: `${base}/contact`,
      children: [
        { labelKey: "contact", href: `${base}/contact` },
        { labelKey: "careers", href: `${base}/contact/careers` },
      ],
    },
  ];
}
