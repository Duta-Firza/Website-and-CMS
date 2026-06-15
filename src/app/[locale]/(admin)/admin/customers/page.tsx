import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

// The row shape stays exported from here because the landing admin page (and
// any future caller) imports `CustomerRow` from this module path.
export interface CustomerRow {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
  invertOnDark: boolean;
  isActive: boolean;
}

/**
 * The standalone Customers admin page was retired — the Customers manager is
 * now mounted as a tab inside /admin/landing, matching where the section
 * appears on the public homepage. Send any deep-link to that tab.
 */
export default async function CustomersAdminRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/admin/landing?tab=customers`);
}
