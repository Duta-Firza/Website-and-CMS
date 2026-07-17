/**
 * Umami analytics configuration (https://umami.is).
 *
 * Values are read straight off `process.env` rather than through the `env`
 * proxy in ./env: that proxy zod-validates the whole server-only schema
 * (MONGODB_URI, NEXTAUTH_SECRET, …) on first property read, and Next only
 * inlines NEXT_PUBLIC_* at build time via direct member access. Same approach
 * NEXT_PUBLIC_SITE_URL already takes in src/app/layout.tsx.
 */

export interface UmamiConfig {
  /** `data-website-id` for the tracker. */
  websiteId: string | null;
  /** Public dashboard URL, embedded as an iframe in the CMS. */
  shareUrl: string | null;
  /** Tracker script URL, derived from `shareUrl` unless explicitly overridden. */
  scriptSrc: string | null;
}

/** Treats an unset var and an empty one (.env.example ships `KEY=""`) alike. */
function read(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Umami serves its tracker from the same origin that hosts the dashboard, so
 * the share URL's origin gives us the script URL for both Umami Cloud
 * (cloud.umami.is/share/… → cloud.umami.is/script.js) and self-hosted installs.
 * Returns null on a malformed share URL so one typo can't throw the public
 * layout — tracking just stays off.
 */
function deriveScriptSrc(shareUrl: string | null, override: string | null): string | null {
  if (override) return override;
  if (!shareUrl) return null;
  try {
    return new URL("/script.js", shareUrl).toString();
  } catch {
    return null;
  }
}

export function getUmamiConfig(): UmamiConfig {
  const websiteId = read(process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID);
  const shareUrl = read(process.env.NEXT_PUBLIC_UMAMI_SHARE_URL);
  const scriptSrc = deriveScriptSrc(shareUrl, read(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL));
  return { websiteId, shareUrl, scriptSrc };
}
