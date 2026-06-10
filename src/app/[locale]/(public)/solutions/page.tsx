import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

/**
 * The standalone /solutions landing was removed — the 3 solution cards now
 * live at the top of each sub-page (Trading / Manufacturing / EPC) with the
 * active one highlighted. Send anyone who lands here to Trading.
 */
export default async function SolutionsLandingRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/solutions/trading`);
}
