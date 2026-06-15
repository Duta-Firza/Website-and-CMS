import type { SectionMode } from "@/models/constants";

interface HeroData {
  eyebrow: string;
  title: string;
  subtitle: string;
}

interface BodyData {
  heading: string;
  content: string;
}

/**
 * Resolve a Page Title (hero) section against its mode flag.
 *
 * - `disabled` → returns null; caller should not render the hero block
 * - `default`  → returns the provided i18n defaults (no DB override)
 * - `custom`   → returns the editor's localized fields, falling back to the
 *                default for any blank field so the layout never has gaps
 */
export function resolveHero({
  mode,
  hero,
  defaults,
}: {
  mode: SectionMode;
  hero: HeroData;
  defaults: HeroData;
}): HeroData | null {
  if (mode === "disabled") return null;
  if (mode === "default") return defaults;
  return {
    eyebrow: hero.eyebrow || defaults.eyebrow,
    title: hero.title || defaults.title,
    subtitle: hero.subtitle || defaults.subtitle,
  };
}

/**
 * Resolve a Page Body section against its mode flag. Mirror semantics of
 * resolveHero — `disabled` skips the section, `default` uses the supplied
 * defaults (typically empty for body), `custom` uses the editor fields.
 */
export function resolveBody({
  mode,
  body,
  defaults,
}: {
  mode: SectionMode;
  body: BodyData;
  defaults: BodyData;
}): BodyData | null {
  if (mode === "disabled") return null;
  if (mode === "default") return defaults;
  return {
    heading: body.heading || defaults.heading,
    content: body.content || defaults.content,
  };
}
