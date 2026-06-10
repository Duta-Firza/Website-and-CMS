import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

/**
 * The standalone Solutions landing admin page was retired — the 3 solution
 * cards are now edited from /admin/landing in the 'Our Solutions' tab,
 * matching where the section lives on the public homepage. Any deep-link to
 * this route lands on that tab.
 */
export default async function SolutionsLandingAdminRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/admin/landing?section=solutions`);
}
