import type { NavTop } from "./main-nav";

/**
 * Active-state logic shared by `desktop-nav` and `mobile-nav`.
 *
 * Strategy: collect every candidate href across the entire nav tree, find
 * the single one that best matches the current pathname (longest), and let
 * each item compare against that one href. This mirrors the section-sidebar
 * approach and is what avoids "Who We Are" staying active on sibling routes
 * when its href equals the section root.
 *
 * Top items use a prefix match (a section is active when any descendant
 * page is the current one), with one special case: top items whose href is
 * the locale root (e.g. `/id`, `/en` — the Home link) match only on exact
 * equality, otherwise they would light up on every page.
 */

function normalize(p: string): string {
  return p.replace(/\/$/, "");
}

function isLocaleRoot(href: string): boolean {
  // Matches "/id", "/en", "/fr-CA", etc. — anything that is just a single
  // locale segment under root with no further path.
  return /^\/[a-z]{2}(?:-[a-z]{2})?$/i.test(normalize(href));
}

export function findActiveHref(items: NavTop[], current: string): string | undefined {
  const c = normalize(current);
  const candidates: string[] = [];
  for (const top of items) {
    candidates.push(top.href);
    for (const sub of top.children ?? []) {
      candidates.push(sub.href);
      for (const ss of sub.children ?? []) candidates.push(ss.href);
    }
  }
  return candidates
    .map(normalize)
    .filter((h) => (isLocaleRoot(h) ? c === h : c === h || c.startsWith(`${h}/`)))
    .sort((a, b) => b.length - a.length)[0];
}

export function isTopActive(activeHref: string | undefined, topHref: string): boolean {
  if (!activeHref) return false;
  const target = normalize(topHref);
  if (isLocaleRoot(target)) return activeHref === target;
  return activeHref === target || activeHref.startsWith(`${target}/`);
}

export function isExactActive(activeHref: string | undefined, href: string): boolean {
  if (!activeHref) return false;
  return activeHref === normalize(href);
}
