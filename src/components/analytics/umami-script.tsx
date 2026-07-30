import Script from "next/script";
import { getUmamiConfig } from "@/lib/umami";

/**
 * Umami tracker. Mounted from the (public) layout only — the root layout is
 * shared with the CMS, so mounting it there would track admin pages too.
 *
 * `data-website-id` isn't a next/script prop; Next forwards unknown attributes
 * verbatim onto the emitted <script>, which is how Umami reads its config.
 */
export function UmamiScript() {
  const { websiteId, scriptSrc } = getUmamiConfig();
  if (!websiteId || !scriptSrc) return null;
  return <Script src={scriptSrc} data-website-id={websiteId} strategy="afterInteractive" defer />;
}
