import { getTranslations } from "next-intl/server";
import { ManualBookViewer } from "@/components/admin/manual-book-viewer";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requirePageScope } from "@/lib/cms/access";
import { getManualBookUrls } from "@/lib/cms/site-settings";

export const dynamic = "force-dynamic";

export default async function ManualBookPage() {
  // Ungated (null): readable by every admin, including viewers — it's help docs.
  await requirePageScope(null);
  const [t, urls] = await Promise.all([
    getTranslations("Admin.pages.manualBook"),
    // Degrade gracefully if Mongo is briefly unreachable (like the dashboard).
    getManualBookUrls().catch(() => ({ id: "", en: "" })),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <ManualBookViewer id={urls.id} en={urls.en} />
    </div>
  );
}
