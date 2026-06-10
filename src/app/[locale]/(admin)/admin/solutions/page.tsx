import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

/**
 * The Solutions overview page was retired — its only real value was the
 * per-page Status switcher, which is now redundant: every sub-page already
 * exposes a 'Page visibility' tab. Send anyone landing here to Trading (the
 * first sub-page) so old bookmarks still resolve to something useful.
 */
export default async function SolutionsOverviewRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/admin/solutions/trading`);
}
