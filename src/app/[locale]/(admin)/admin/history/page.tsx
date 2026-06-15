import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function HistoryAdminRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/admin/about/history`);
}
